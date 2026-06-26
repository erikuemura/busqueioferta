"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Category, Marketplace, OfferStatus, SocialPlatform, StockStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calcDiscountPercent } from "@/lib/utils";
import { buildAffiliateUrl } from "@/lib/affiliateLinks";
import { offerToVars, renderTemplate } from "@/lib/social/whatsapp";
import { getSetting } from "@/lib/settings";
import { enqueueGenerateSocialImage } from "@/lib/queue";
import { requireSession } from "./guard";

function num(v: FormDataEntryValue | null): number {
  return Number(String(v ?? "").replace(",", "."));
}

export async function saveOfferAction(formData: FormData) {
  await requireSession();

  const id = (formData.get("id") as string) || null;
  const originalPrice = num(formData.get("originalPrice"));
  const currentPrice = num(formData.get("currentPrice"));
  const marketplace = formData.get("marketplace") as Marketplace;
  const rawUrl = formData.get("affiliateUrl") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;

  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    imageUrl: formData.get("imageUrl") as string,
    originalPrice,
    currentPrice,
    discountPercent: calcDiscountPercent(originalPrice, currentPrice),
    affiliateUrl: buildAffiliateUrl(marketplace, rawUrl),
    marketplace,
    category: formData.get("category") as Category,
    status: formData.get("status") as OfferStatus,
    stockStatus: formData.get("stockStatus") as StockStatus,
    featured: formData.get("featured") === "on",
    expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
  };

  if (id) {
    await prisma.offer.update({ where: { id }, data });
  } else {
    await prisma.offer.create({ data: { ...data, marketplace: "MANUAL", publishedAt: new Date() } });
  }

  revalidatePath("/admin/ofertas");
  revalidatePath("/");
  redirect("/admin/ofertas");
}

export async function archiveOfferAction(id: string) {
  await requireSession();
  await prisma.offer.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/ofertas");
}

export async function bulkArchiveAction(ids: string[]) {
  await requireSession();
  await prisma.offer.updateMany({ where: { id: { in: ids } }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/ofertas");
}

/**
 * Cria os SocialPosts (status PENDING) e enfileira a geração de imagem.
 * Sem Redis o post fica PENDING e pode ser gerado/visto via /api/social/{id}/image.
 */
export async function publishToSocialAction(offerId: string, platforms: SocialPlatform[]) {
  await requireSession();
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer) return;

  const waTemplate = await getSetting("whatsappTemplate");
  const igTemplate = await getSetting("instagramTemplate");
  const vars = offerToVars(offer);

  for (const platform of platforms) {
    const caption =
      platform === "INSTAGRAM" || platform === "TIKTOK"
        ? renderTemplate(igTemplate, vars)
        : renderTemplate(waTemplate, vars);

    await prisma.socialPost.create({
      data: { offerId, platform, caption, status: "PENDING" },
    });
    await enqueueGenerateSocialImage(offerId, platform);
  }

  await prisma.offer.update({ where: { id: offerId }, data: { publishedAt: new Date() } });
  revalidatePath("/admin/social");
  revalidatePath("/admin/ofertas");
}

export async function triggerAutoPublishAction() {
  await requireSession();
  const { runAutoPublish } = await import("@/lib/scheduler");
  const results = await runAutoPublish();
  revalidatePath("/admin/social");
  return results;
}

export async function broadcastWhatsappAction(offerId: string) {
  await requireSession();
  const { broadcastOfferWhatsapp } = await import("@/lib/broadcast");
  const result = await broadcastOfferWhatsapp(offerId);
  revalidatePath("/admin/ofertas");
  return result;
}

export async function pushOfferAction(offerId: string) {
  await requireSession();
  const { pushOffer } = await import("@/lib/push");
  const result = await pushOffer(offerId);
  revalidatePath("/admin/ofertas");
  return result;
}

export async function retrySocialPostAction(id: string) {
  await requireSession();
  const post = await prisma.socialPost.update({
    where: { id },
    data: { status: "PENDING", error: null },
  });
  await enqueueGenerateSocialImage(post.offerId, post.platform);
  revalidatePath("/admin/social");
}

export async function saveSettingsAction(formData: FormData) {
  await requireSession();
  const entries = Array.from(formData.entries()).filter(([k]) => k !== "id");
  for (const [key, value] of entries) {
    await prisma.settings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  revalidatePath("/admin/configuracoes");
}
