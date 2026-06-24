import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { getCategoryMeta, getMarketplaceMeta } from "@/lib/categories";
import { requireSession } from "../guard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireSession();

  const now = Date.now();
  const in4h = new Date(now + 4 * 3600_000);
  const ago24h = new Date(now - 24 * 3600_000);
  const ago7d = new Date(now - 7 * 24 * 3600_000);
  const ago30d = new Date(now - 30 * 24 * 3600_000);

  const [
    activeCount,
    draftCount,
    agg,
    expiringSoon,
    recentPosts,
    byCategory,
    byMarketplace,
    clicks24h,
    clicks7d,
    clicks30d,
  ] = await Promise.all([
      prisma.offer.count({ where: { status: "ACTIVE" } }),
      prisma.offer.count({ where: { status: "DRAFT" } }),
      prisma.offer.aggregate({ _sum: { clicks: true, shares: true } }),
      prisma.offer.findMany({
        where: { status: "ACTIVE", expiresAt: { lte: in4h, gte: new Date() } },
        orderBy: { expiresAt: "asc" },
        take: 6,
      }),
      prisma.socialPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { offer: { select: { title: true } } },
      }),
      prisma.offer.groupBy({ by: ["category"], where: { status: "ACTIVE" }, _count: true, _sum: { clicks: true } }),
      prisma.offer.groupBy({ by: ["marketplace"], where: { status: "ACTIVE" }, _count: true }),
      prisma.clickEvent.count({ where: { type: "CLICK", createdAt: { gte: ago24h } } }),
      prisma.clickEvent.count({ where: { type: "CLICK", createdAt: { gte: ago7d } } }),
      prisma.clickEvent.count({ where: { type: "CLICK", createdAt: { gte: ago30d } } }),
    ]);

  const totalClicks = agg._sum.clicks ?? 0;
  const totalShares = agg._sum.shares ?? 0;
  const maxCatClicks = Math.max(1, ...byCategory.map((c) => c._sum.clicks ?? 0));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Ofertas ativas" value={activeCount} />
        <Stat label="Rascunhos (DRAFT)" value={draftCount} />
        <Stat label="Cliques (total)" value={totalClicks} />
        <Stat label="Compartilhamentos" value={totalShares} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Cliques em links de afiliado
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Últimas 24h" value={clicks24h} />
          <Stat label="Últimos 7 dias" value={clicks7d} />
          <Stat label="Últimos 30 dias" value={clicks30d} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">⏳ Expirando nas próximas 4h</h2>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma oferta expirando em breve.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {expiringSoon.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <Link href={`/admin/ofertas/${o.id}/editar`} className="line-clamp-1 hover:text-brand">
                    {o.title}
                  </Link>
                  <span className="shrink-0 text-amber-400">{formatDateTime(o.expiresAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">📲 Últimas publicações sociais</h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma publicação ainda.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentPosts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="line-clamp-1">{p.offer.title}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {p.platform} · {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Cliques por categoria</h2>
          <div className="space-y-2">
            {byCategory
              .sort((a, b) => (b._sum.clicks ?? 0) - (a._sum.clicks ?? 0))
              .map((c) => {
                const meta = getCategoryMeta(c.category);
                const clicks = c._sum.clicks ?? 0;
                return (
                  <div key={c.category} className="text-sm">
                    <div className="mb-1 flex justify-between">
                      <span>
                        {meta.icon} {meta.label}
                      </span>
                      <span className="text-gray-400">{clicks} cliques · {c._count} ofertas</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-white/5">
                      <div className="h-full bg-brand" style={{ width: `${(clicks / maxCatClicks) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold">Ofertas por marketplace</h2>
          <div className="flex flex-wrap gap-2">
            {byMarketplace.map((m) => {
              const meta = getMarketplaceMeta(m.marketplace);
              return (
                <span
                  key={m.marketplace}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-black"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.label}: {m._count}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}
