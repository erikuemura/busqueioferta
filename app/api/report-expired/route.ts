import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const COOKIE = "bo_reporter";
const AUTO_EXPIRE_THRESHOLD = 3; // reportes únicos até marcar EXPIRED automaticamente

const schema = z.object({ offerId: z.string() });

/**
 * Reporte da comunidade de que uma oferta expirou/está indisponível.
 * Substitui o monitoramento automático (bloqueado para o Mercado Livre) —
 * quem tenta comprar e não consegue, avisa com 1 clique. Dedup por cookie.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "report-expired"), 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "offerId obrigatório" }, { status: 400 });
  const { offerId } = parsed.data;

  const offer = await prisma.offer.findUnique({ where: { id: offerId }, select: { id: true } });
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });

  let reporterKey = req.cookies.get(COOKIE)?.value;
  const newCookie = !reporterKey;
  if (!reporterKey) reporterKey = crypto.randomUUID();

  const already = await prisma.expiredReport.findUnique({
    where: { offerId_reporterKey: { offerId, reporterKey } },
    select: { id: true },
  });

  let count: number;
  if (already) {
    count = await prisma.expiredReport.count({ where: { offerId } });
  } else {
    await prisma.expiredReport.create({ data: { offerId, reporterKey } });
    const updated = await prisma.offer.update({
      where: { id: offerId },
      data: { expiredReportsCount: { increment: 1 } },
      select: { expiredReportsCount: true },
    });
    count = updated.expiredReportsCount;

    if (count >= AUTO_EXPIRE_THRESHOLD) {
      await prisma.offer.update({ where: { id: offerId }, data: { status: "OUT_OF_STOCK" } });
      logger.info("report_expired.auto_flagged", { offerId, count });
    }
  }

  const res = NextResponse.json({ ok: true, alreadyReported: Boolean(already), count });
  if (newCookie) {
    res.cookies.set(COOKIE, reporterKey, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return res;
}
