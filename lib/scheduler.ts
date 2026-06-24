import type { SocialPlatform } from "@prisma/client";
import { prisma } from "./prisma";
import { getSetting } from "./settings";
import { offerToVars, renderTemplate } from "./social/whatsapp";
import { isInstagramConfigured } from "./social/instagram";
import { isTikTokConfigured } from "./social/tiktok";
import { isTelegramConfigured } from "./social/telegram";
import { enqueueGenerateSocialImage } from "./queue";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Limite diário por plataforma (regra de negócio #4). Infinity = sem limite. */
async function dailyCap(platform: SocialPlatform): Promise<number> {
  if (platform === "INSTAGRAM") return Number(await getSetting("maxInstagramPerDay"));
  if (platform === "TIKTOK") return Number(await getSetting("maxTiktokPerDay"));
  return Infinity;
}

/** Plataformas que devem auto-publicar agora (apenas as com credenciais). */
export function enabledAutoPlatforms(): SocialPlatform[] {
  const out: SocialPlatform[] = [];
  if (isInstagramConfigured()) out.push("INSTAGRAM");
  if (isTikTokConfigured()) out.push("TIKTOK");
  if (isTelegramConfigured()) out.push("TELEGRAM");
  if (process.env.WHATSAPP_API_URL) out.push("WHATSAPP");
  return out;
}

export interface AutoPublishResult {
  platform: SocialPlatform;
  queued: number;
  remaining: number;
}

/**
 * Seleciona as melhores ofertas ainda não divulgadas e agenda posts respeitando:
 *  - score mínimo (autoScoreThreshold)
 *  - limite diário por plataforma
 *  - deduplicação: mesma oferta não vai para a mesma plataforma dentro da janela
 * Cria os SocialPosts e enfileira a geração de imagem (que dispara a publicação).
 */
export async function runAutoPublish(): Promise<AutoPublishResult[]> {
  const scoreThreshold = Number(await getSetting("autoScoreThreshold"));
  const dedupDays = Number(await getSetting("dedupWindowDays"));
  const dedupSince = new Date(Date.now() - dedupDays * 24 * 3600_000);
  const waTemplate = await getSetting("whatsappTemplate");
  const igTemplate = await getSetting("instagramTemplate");

  const results: AutoPublishResult[] = [];

  for (const platform of enabledAutoPlatforms()) {
    const cap = await dailyCap(platform);
    const todayCount = await prisma.socialPost.count({
      where: { platform, createdAt: { gte: startOfToday() }, status: { not: "FAILED" } },
    });
    const budget = cap === Infinity ? 25 : Math.max(0, cap - todayCount);
    if (budget <= 0) {
      results.push({ platform, queued: 0, remaining: 0 });
      continue;
    }

    // ofertas elegíveis: ativas, com score, sem post recente nessa plataforma
    const candidates = await prisma.offer.findMany({
      where: {
        status: "ACTIVE",
        score: { gte: scoreThreshold },
        socialPosts: { none: { platform, createdAt: { gte: dedupSince } } },
      },
      orderBy: [{ featured: "desc" }, { score: "desc" }],
      take: budget,
    });

    let queued = 0;
    for (const offer of candidates) {
      const template = platform === "INSTAGRAM" || platform === "TIKTOK" ? igTemplate : waTemplate;
      const caption = renderTemplate(template, offerToVars(offer));
      await prisma.socialPost.create({ data: { offerId: offer.id, platform, caption, status: "PENDING" } });
      await enqueueGenerateSocialImage(offer.id, platform);
      queued++;
    }

    results.push({ platform, queued, remaining: cap === Infinity ? Infinity : cap - todayCount - queued });
  }

  return results;
}
