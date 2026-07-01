import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff } from "@/app/admin/guard";
import { getConfiguredAdapters } from "@/lib/marketplaces";
import { upsertOffers } from "@/lib/sync";
import { getSetting } from "@/lib/settings";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sincronização agendada (Vercel Cron a cada 2h) — busca ofertas nos marketplaces
 * configurados e persiste. Também pode ser disparado manualmente por um admin.
 * Autorização: Bearer CRON_SECRET (enviado pelo Vercel Cron) OU sessão de equipe.
 */
async function authorize(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (secret && header === `Bearer ${secret}`) return true;
  const session = await auth();
  return isStaff((session?.user as { role?: string } | undefined)?.role);
}

export async function GET(req: NextRequest) {
  if (!(await authorize(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const adapters = getConfiguredAdapters();
  if (adapters.length === 0) {
    return NextResponse.json({ ok: true, note: "nenhum adapter configurado", totals: null });
  }

  const minDiscount = Number(await getSetting("minDiscount"));
  const queries = (await getSetting("searchQueries")).split(",").map((q) => q.trim()).filter(Boolean).slice(0, 3);

  const totals = { created: 0, updated: 0, skipped: 0 };
  const errors: string[] = [];
  for (const adapter of adapters) {
    for (const query of queries.length ? queries : [undefined]) {
      try {
        const offers = await adapter.fetchOffers({ query, minDiscount, limit: 40 });
        const r = await upsertOffers(offers);
        totals.created += r.created;
        totals.updated += r.updated;
        totals.skipped += r.skipped;
      } catch (err) {
        errors.push(`${adapter.marketplace}: ${(err as Error).message}`);
      }
    }
  }

  logger.info("cron.sync", { totals, errors });
  return NextResponse.json({ ok: true, totals, errors });
}
