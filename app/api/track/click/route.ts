import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Rastreia clique/compartilhamento e redireciona para o link afiliado.
 *   /api/track/click?offerId=XXX           → incrementa clicks e redireciona
 *   /api/track/click?offerId=XXX&type=share → incrementa shares (sem redirect, usado por sendBeacon)
 */
export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offerId");
  const type = req.nextUrl.searchParams.get("type");
  if (!offerId) return NextResponse.json({ error: "offerId obrigatório" }, { status: 400 });

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { affiliateUrl: true },
  });
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });

  const referer = req.headers.get("referer") ?? undefined;

  if (type === "share") {
    await prisma.$transaction([
      prisma.offer.update({ where: { id: offerId }, data: { shares: { increment: 1 } } }),
      prisma.clickEvent.create({ data: { offerId, type: "SHARE", referer } }),
    ]);
    return new NextResponse(null, { status: 204 });
  }

  await prisma.$transaction([
    prisma.offer.update({ where: { id: offerId }, data: { clicks: { increment: 1 } } }),
    prisma.clickEvent.create({ data: { offerId, type: "CLICK", referer } }),
  ]);
  return NextResponse.redirect(offer.affiliateUrl, { status: 302 });
}
