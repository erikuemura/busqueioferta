/**
 * Sync sob demanda — popula o banco com ofertas reais sem precisar de Redis/workers.
 *
 *   npm run sync                      # usa os termos de busca das configurações
 *   npm run sync -- "fone bluetooth"  # busca um termo específico
 *   npm run sync -- --limit 80        # nº de itens por termo/adapter
 *
 * Roda todos os adapters configurados (com credenciais/feed). Hoje:
 *   - Mercado Livre: defina ML_CLIENT_ID + ML_CLIENT_SECRET (OAuth) no .env.local
 *   - Awin (Magalu/Kabum/...): defina AWIN_FEED_<MARKETPLACE> apontando p/ o CSV
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { getConfiguredAdapters } from "@/lib/marketplaces";
import { upsertOffers } from "@/lib/sync";
import { getSetting } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let limit: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") limit = Number(argv[++i]);
    else positional.push(argv[i]);
  }
  return { query: positional.join(" ").trim() || undefined, limit };
}

async function main() {
  const { query, limit } = parseArgs(process.argv.slice(2));

  const adapters = getConfiguredAdapters();
  if (adapters.length === 0) {
    console.log(
      "⚠ Nenhum adapter configurado. Configure ML_CLIENT_ID/ML_CLIENT_SECRET ou AWIN_FEED_* no .env.local.\n" +
        "  (Sem isso, use `npm run db:seed` para carregar ofertas de exemplo.)",
    );
    return;
  }

  const minDiscount = Number(await getSetting("minDiscount"));
  const queries = query
    ? [query]
    : (await getSetting("searchQueries")).split(",").map((q) => q.trim()).filter(Boolean);

  const totals = { created: 0, updated: 0, skipped: 0 };
  for (const adapter of adapters) {
    for (const q of queries.length ? queries : [undefined]) {
      try {
        process.stdout.write(`→ ${adapter.marketplace} "${q ?? "(feed)"}" ... `);
        const offers = await adapter.fetchOffers({ query: q, minDiscount, limit: limit ?? 50 });
        const r = await upsertOffers(offers);
        totals.created += r.created;
        totals.updated += r.updated;
        totals.skipped += r.skipped;
        console.log(`+${r.created} novas, ${r.updated} atualizadas, ${r.skipped} ignoradas`);
      } catch (err) {
        console.log(`falhou: ${(err as Error).message}`);
      }
    }
  }

  console.log(`\n✓ Sync concluído:`, totals);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
