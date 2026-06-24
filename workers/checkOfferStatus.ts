import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { getAdapter } from "@/lib/marketplaces";
import { getSetting } from "@/lib/settings";

/**
 * check-offer-status (a cada 30min): revalida ofertas ACTIVE.
 *  - expirada por data → EXPIRED
 *  - indisponível na API → incrementa notFoundCount; após N → EXPIRED
 *  - sem estoque → OUT_OF_STOCK
 */
export function createCheckStatusWorker(connection: ConnectionOptions) {
  return new Worker(
    QUEUE_NAMES.checkOfferStatus,
    async () => {
      const threshold = Number(await getSetting("notFoundThreshold"));
      const now = new Date();

      // 1) expiração por data
      const expired = await prisma.offer.updateMany({
        where: { status: "ACTIVE", expiresAt: { not: null, lt: now } },
        data: { status: "EXPIRED" },
      });

      // 2) revalidação via API (somente marketplaces com checkAvailability)
      const active = await prisma.offer.findMany({
        where: { status: "ACTIVE", externalId: { not: null } },
        select: { id: true, marketplace: true, externalId: true, notFoundCount: true, featured: true, title: true },
        take: 300,
      });

      let updated = 0;
      for (const o of active) {
        const adapter = getAdapter(o.marketplace);
        if (!adapter?.checkAvailability || !o.externalId) continue;
        try {
          const { available, currentPrice } = await adapter.checkAvailability(o.externalId);
          if (!available) {
            const nf = o.notFoundCount + 1;
            await prisma.offer.update({
              where: { id: o.id },
              data: nf >= threshold ? { status: "EXPIRED", notFoundCount: nf } : { stockStatus: "OUT_OF_STOCK", notFoundCount: nf },
            });
            if (o.featured) console.warn(`[check] ⚠ destaque indisponível: ${o.title}`);
            updated++;
          } else if (currentPrice) {
            await prisma.offer.update({ where: { id: o.id }, data: { currentPrice, notFoundCount: 0 } });
          }
        } catch (err) {
          console.error(`[check] ${o.id}:`, (err as Error).message);
        }
      }

      console.log(`[check] expiradas=${expired.count} revalidadas=${updated}`);
      return { expired: expired.count, updated };
    },
    { connection },
  );
}
