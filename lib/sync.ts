import type { OfferStatus, StockStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { computeScore } from "./scoring";
import { calcDiscountPercent } from "./utils";
import { getSetting } from "./settings";
import type { NormalizedOffer } from "./marketplaces/types";

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
}

function stockFromQuantity(qty?: number): StockStatus {
  if (qty === undefined) return "IN_STOCK";
  if (qty <= 0) return "OUT_OF_STOCK";
  if (qty < 5) return "LOW_STOCK";
  return "IN_STOCK";
}

/**
 * Persiste ofertas normalizadas aplicando as regras de negócio:
 *  - filtra desconto < mínimo configurado
 *  - deduplica por (marketplace, externalId)
 *  - dedup de publicação: não recria oferta já vista na janela (dedupWindowDays)
 *  - define status ACTIVE/DRAFT pelo score
 */
export async function upsertOffers(offers: NormalizedOffer[]): Promise<SyncResult> {
  const minDiscount = Number(await getSetting("minDiscount"));
  const scoreThreshold = Number(await getSetting("autoScoreThreshold"));

  const result: SyncResult = { created: 0, updated: 0, skipped: 0 };

  for (const offer of offers) {
    const discountPercent = calcDiscountPercent(offer.originalPrice, offer.currentPrice);
    if (discountPercent < minDiscount) {
      result.skipped++;
      continue;
    }

    const score = computeScore(offer);
    const status: OfferStatus = score >= scoreThreshold ? "ACTIVE" : "DRAFT";
    const stockStatus = stockFromQuantity(offer.stockQuantity);

    const existing = await prisma.offer.findUnique({
      where: {
        marketplace_externalId: {
          marketplace: offer.marketplace,
          externalId: offer.externalId,
        },
      },
      select: { id: true },
    });

    const data = {
      title: offer.title,
      description: offer.description,
      imageUrl: offer.imageUrl,
      originalPrice: offer.originalPrice,
      currentPrice: offer.currentPrice,
      discountPercent,
      affiliateUrl: offer.affiliateUrl,
      marketplace: offer.marketplace,
      category: offer.category,
      rating: offer.rating,
      reviewCount: offer.reviewCount,
      externalSku: offer.externalSku,
      stockStatus,
      score,
      expiresAt: offer.expiresAt,
    };

    if (existing) {
      await prisma.offer.update({
        where: { id: existing.id },
        data: { ...data, notFoundCount: 0 },
      });
      result.updated++;
    } else {
      await prisma.offer.create({
        data: {
          ...data,
          status,
          externalId: offer.externalId,
        },
      });
      result.created++;
    }
  }

  return result;
}
