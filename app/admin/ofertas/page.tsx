import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, MARKETPLACES } from "@/lib/categories";
import { requireSession } from "../guard";
import { OffersTable } from "./OffersTable";

export const dynamic = "force-dynamic";

const STATUSES = ["ACTIVE", "DRAFT", "EXPIRED", "OUT_OF_STOCK", "ARCHIVED"] as const;

export default async function OffersPage({
  searchParams,
}: {
  searchParams: { marketplace?: string; category?: string; status?: string; q?: string };
}) {
  await requireSession();

  const where: Prisma.OfferWhereInput = {
    ...(searchParams.marketplace ? { marketplace: searchParams.marketplace as never } : {}),
    ...(searchParams.category ? { category: searchParams.category as never } : {}),
    ...(searchParams.status ? { status: searchParams.status as never } : {}),
    ...(searchParams.q ? { title: { contains: searchParams.q, mode: "insensitive" } } : {}),
  };

  const offers = await prisma.offer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ofertas</h1>
        <Link href="/admin/ofertas/nova" className="btn-brand text-sm">
          + Nova oferta manual
        </Link>
      </div>

      <form className="card flex flex-wrap items-end gap-3 p-4">
        <Field label="Buscar">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Título..."
            className="input"
          />
        </Field>
        <Field label="Marketplace">
          <select name="marketplace" defaultValue={searchParams.marketplace ?? ""} className="input">
            <option value="">Todos</option>
            {MARKETPLACES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Categoria">
          <select name="category" defaultValue={searchParams.category ?? ""} className="input">
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={searchParams.status ?? ""} className="input">
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <button className="btn-ghost text-sm">Filtrar</button>
      </form>

      <OffersTable offers={offers} />

      <style>{`.input{background:var(--bg);border:1px solid var(--border);border-radius:0.6rem;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e8eaed}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-400">
      {label}
      {children}
    </label>
  );
}
