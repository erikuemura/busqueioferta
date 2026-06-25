import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function hostOf(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function deviceOf(ua: string | null): string {
  return ua && /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
}

/**
 * Rastreia clique/compartilhamento/visualização e redireciona ao link de afiliado.
 *   /api/track/click?offerId=XXX            → clique de oferta (redireciona)
 *   /api/track/click?couponId=XXX           → clique de cupom (redireciona)
 *   ?type=share|view                        → registra evento sem redirecionar
 *   &utm_source=instagram&utm_medium=...    → atribuição de tráfego
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "track"), 120, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const offerId = sp.get("offerId");
  const couponId = sp.get("couponId");
  const type = (sp.get("type") ?? "click").toUpperCase();

  const referer = req.headers.get("referer");
  const meta = {
    referer: referer ?? undefined,
    source: hostOf(referer),
    device: deviceOf(req.headers.get("user-agent")),
    country: req.headers.get("x-vercel-ip-country") ?? undefined,
    utmSource: sp.get("utm_source") ?? undefined,
    utmMedium: sp.get("utm_medium") ?? undefined,
    utmCampaign: sp.get("utm_campaign") ?? undefined,
  };

  // ----- Cupom -----
  if (couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: couponId }, select: { affiliateUrl: true } });
    if (!coupon) return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    await prisma.$transaction([
      prisma.coupon.update({ where: { id: couponId }, data: { clicks: { increment: 1 } } }),
      prisma.clickEvent.create({ data: { couponId, type: "CLICK", ...meta } }),
    ]);
    return NextResponse.redirect(coupon.affiliateUrl, { status: 302 });
  }

  // ----- Oferta -----
  if (!offerId) return NextResponse.json({ error: "offerId ou couponId obrigatório" }, { status: 400 });

  const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { affiliateUrl: true } });
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });

  if (type === "SHARE" || type === "VIEW") {
    await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: type === "SHARE" ? { shares: { increment: 1 } } : {},
      }),
      prisma.clickEvent.create({ data: { offerId, type: type as "SHARE" | "VIEW", ...meta } }),
    ]);
    return new NextResponse(null, { status: 204 });
  }

  try {
    await prisma.$transaction([
      prisma.offer.update({ where: { id: offerId }, data: { clicks: { increment: 1 } } }),
      prisma.clickEvent.create({ data: { offerId, type: "CLICK", ...meta } }),
    ]);
  } catch (err) {
    logger.error("track.click.persist_failed", err, { offerId });
  }
  return NextResponse.redirect(offer.affiliateUrl, { status: 302 });
}
