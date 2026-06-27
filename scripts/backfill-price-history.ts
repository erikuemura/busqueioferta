/**
 * Backfill de histórico de preço para ofertas que ainda não têm.
 * Gera ~12 pontos nos últimos 90 dias, partindo perto do preço original e
 * convergindo ao preço atual (que fica como menor do período).
 *   npx tsx scripts/backfill-price-history.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.offer.findMany({ select: { id: true, originalPrice: true, currentPrice: true } });
  let created = 0;
  for (const o of offers) {
    const existing = await prisma.priceHistory.count({ where: { offerId: o.id } });
    if (existing >= 2) continue;

    const points = 12;
    const spread = Math.max(0, o.originalPrice - o.currentPrice);
    const data = [];
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1); // 0 (90d atrás) → 1 (recente)
      // mais alto no passado, convergindo ao atual; ruído leve
      const base = o.currentPrice + spread * (1 - t) * (0.4 + Math.random() * 0.6);
      const price = Math.max(o.currentPrice, Math.round(base * 100) / 100);
      data.push({
        offerId: o.id,
        price,
        recordedAt: new Date(Date.now() - (90 - i * 7) * 24 * 3600_000),
      });
    }
    await prisma.priceHistory.createMany({ data });
    created += data.length;
  }
  console.log(`✓ ${created} pontos de histórico criados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
