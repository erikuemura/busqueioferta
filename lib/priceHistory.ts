import { prisma } from "./prisma";

export interface PricePoint {
  price: number;
  recordedAt: Date;
}

export interface PriceStats {
  points: PricePoint[];
  min: number;
  max: number;
  current: number;
  isLowest: boolean; // preço atual == menor do período
  days: number;
}

/** Estatísticas de preço de uma oferta no período (default 90 dias). */
export async function getPriceStats(offerId: string, current: number, days = 90): Promise<PriceStats | null> {
  const since = new Date(Date.now() - days * 24 * 3600_000);
  let rows: PricePoint[] = [];
  try {
    rows = await prisma.priceHistory.findMany({
      where: { offerId, recordedAt: { gte: since } },
      orderBy: { recordedAt: "asc" },
      select: { price: true, recordedAt: true },
    });
  } catch {
    return null;
  }
  if (rows.length < 2) return null;

  const prices = rows.map((r) => r.price).concat(current);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return {
    points: rows,
    min,
    max,
    current,
    isLowest: current <= min + 0.001,
    days,
  };
}

/** Registra um ponto de preço (chamado quando o preço muda no sync). */
export async function recordPrice(offerId: string, price: number): Promise<void> {
  await prisma.priceHistory.create({ data: { offerId, price } }).catch(() => {});
}
