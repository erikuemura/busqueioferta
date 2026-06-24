import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "@/lib/queue";
import { getConfiguredAdapters } from "@/lib/marketplaces";
import { upsertOffers } from "@/lib/sync";
import { getSetting } from "@/lib/settings";

/**
 * sync-marketplace (a cada 2h): busca novas ofertas em cada marketplace
 * configurado, normaliza, deduplica e persiste com score/status.
 */
export function createSyncWorker(connection: ConnectionOptions) {
  return new Worker(
    QUEUE_NAMES.syncMarketplace,
    async () => {
      const minDiscount = Number(await getSetting("minDiscount"));
      const queries = (await getSetting("searchQueries")).split(",").map((q) => q.trim()).filter(Boolean);
      const adapters = getConfiguredAdapters();

      const totals = { created: 0, updated: 0, skipped: 0 };
      for (const adapter of adapters) {
        for (const query of queries.length ? queries : [undefined]) {
          try {
            const offers = await adapter.fetchOffers({ query, minDiscount, limit: 50 });
            const r = await upsertOffers(offers);
            totals.created += r.created;
            totals.updated += r.updated;
            totals.skipped += r.skipped;
          } catch (err) {
            console.error(`[sync] ${adapter.marketplace} falhou:`, (err as Error).message);
          }
        }
      }
      console.log(`[sync] concluído`, totals);
      return totals;
    },
    { connection },
  );
}
