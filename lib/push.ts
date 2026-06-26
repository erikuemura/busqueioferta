import webpush from "web-push";
import type { Offer } from "@prisma/client";
import { prisma } from "./prisma";
import { formatPrice } from "./utils";
import { getMarketplaceMeta } from "./categories";
import { absoluteUrl } from "./seo";
import { logger } from "./logger";

let configured = false;
export function isPushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function ensureConfigured() {
  if (configured || !isPushConfigured()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contato@busqueioferta.com.br",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
}

interface SubRecord {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function sendTo(sub: SubRecord, payload: PushPayload): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    // 404/410 = inscrição expirada/cancelada → remove
    if (status === 404 || status === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    }
    return false;
  }
}

export interface PushResult {
  total: number;
  sent: number;
  failed: number;
  configured: boolean;
}

/**
 * Envia uma notificação de oferta aos inscritos:
 *  - clientes cujos interesses incluem a categoria da oferta;
 *  - inscrições anônimas (sem conta) recebem ofertas em destaque.
 */
export async function pushOffer(offerId: string): Promise<PushResult> {
  ensureConfigured();
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) throw new Error("Oferta não encontrada");

  if (!isPushConfigured()) return { total: 0, sent: 0, failed: 0, configured: false };

  const subs = await prisma.pushSubscription.findMany({
    where: {
      OR: [
        { user: { interests: { has: offer.category } } },
        ...(offer.featured ? [{ userId: null }] : []),
      ],
    },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  const payload = buildOfferPayload(offer);
  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    (await sendTo(sub, payload)) ? sent++ : failed++;
  }

  logger.info("push.offer", { offerId, total: subs.length, sent, failed });
  return { total: subs.length, sent, failed, configured: true };
}

/** Notifica quem favoritou a oferta quando o preço cai. */
export async function pushPriceDrop(offerId: string, oldPrice: number): Promise<PushResult> {
  ensureConfigured();
  if (!isPushConfigured()) return { total: 0, sent: 0, failed: 0, configured: false };
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) return { total: 0, sent: 0, failed: 0, configured: true };

  const subs = await prisma.pushSubscription.findMany({
    where: { user: { watchlist: { some: { offerId } } } },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  const payload: PushPayload = {
    title: `📉 Baixou de preço! ${getMarketplaceMeta(offer.marketplace).label}`,
    body: `${offer.title}: de ${formatPrice(oldPrice)} por ${formatPrice(offer.currentPrice)}`,
    url: `/oferta/${offer.id}`,
    image: offer.imageUrl,
    tag: `drop-${offer.id}`,
    icon: absoluteUrl("/icon-192.png"),
  };

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    (await sendTo(sub, payload)) ? sent++ : failed++;
  }
  logger.info("push.price_drop", { offerId, oldPrice, newPrice: offer.currentPrice, total: subs.length, sent, failed });
  return { total: subs.length, sent, failed, configured: true };
}

function buildOfferPayload(offer: Offer): PushPayload {
  return {
    title: `🔥 ${Math.round(offer.discountPercent)}% OFF — ${getMarketplaceMeta(offer.marketplace).label}`,
    body: `${offer.title} por ${formatPrice(offer.currentPrice)}`,
    url: `/oferta/${offer.id}`,
    image: offer.imageUrl,
    tag: `offer-${offer.id}`,
    icon: absoluteUrl("/icon-192.png"),
  };
}
