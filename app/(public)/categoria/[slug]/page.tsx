import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Marketplace, Offer, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug, PUBLIC_MARKETPLACES } from "@/lib/categories";
import { buildMetadata, breadcrumbLd, itemListLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/CategoryNav";
import { OfferGrid } from "@/components/OfferGrid";

export const revalidate = 900;

const PAGE_SIZE = 16;

const SORTS: Record<string, { label: string; orderBy: Prisma.OfferOrderByWithRelationInput }> = {
  desconto: { label: "Maior desconto", orderBy: { discountPercent: "desc" } },
  preco: { label: "Menor preço", orderBy: { currentPrice: "asc" } },
  recente: { label: "Mais recentes", orderBy: { createdAt: "desc" } },
  popular: { label: "Mais clicadas", orderBy: { clicks: "desc" } },
};

const DISCOUNTS = [10, 20, 30, 40, 50];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};
  return buildMetadata({
    title: `Ofertas de ${cat.label} com desconto`,
    description: `As melhores ofertas e promoções de ${cat.label} dos principais marketplaces do Brasil. Compare preços e economize com link verificado.`,
    path: `/categoria/${cat.slug}`,
  });
}

interface SP {
  sort?: string;
  page?: string;
  loja?: string;
  desc?: string;
  max?: string;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SP;
}) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const sortKey = searchParams.sort && SORTS[searchParams.sort] ? searchParams.sort : "desconto";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const loja = PUBLIC_MARKETPLACES.find((m) => m.slug === searchParams.loja)?.value as Marketplace | undefined;
  const minDiscount = Number(searchParams.desc) || 0;
  const maxPrice = Number(searchParams.max) || 0;

  const where: Prisma.OfferWhereInput = {
    status: "ACTIVE",
    category: cat.value,
    ...(loja ? { marketplace: loja } : {}),
    ...(minDiscount ? { discountPercent: { gte: minDiscount } } : {}),
    ...(maxPrice ? { currentPrice: { lte: maxPrice } } : {}),
  };

  let offers: Offer[] = [];
  let total = 0;
  try {
    [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: SORTS[sortKey].orderBy,
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.offer.count({ where }),
    ]);
  } catch (err) {
    console.error("[categoria] falha ao carregar ofertas:", (err as Error).message);
  }

  const hasMore = page * PAGE_SIZE < total;
  // preserva filtros ao trocar ordenação/paginação
  const baseParams = (extra: Record<string, string | number>) => {
    const sp = new URLSearchParams();
    if (searchParams.loja) sp.set("loja", searchParams.loja);
    if (minDiscount) sp.set("desc", String(minDiscount));
    if (maxPrice) sp.set("max", String(maxPrice));
    for (const [k, v] of Object.entries(extra)) sp.set(k, String(v));
    return `?${sp.toString()}`;
  };
  const hasFilters = Boolean(loja || minDiscount || maxPrice);

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <div className="mb-5">
          <CategoryNav activeSlug={cat.slug} />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">
            {cat.icon} {cat.label} <span className="text-sm font-normal text-gray-500">({total})</span>
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SORTS).map(([key, { label }]) => (
              <Link
                key={key}
                href={`/categoria/${cat.slug}${baseParams({ sort: key })}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  key === sortKey ? "bg-brand text-white" : "border border-[var(--border)] text-gray-300 hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <form className="card mb-5 flex flex-wrap items-end gap-3 p-4">
          <input type="hidden" name="sort" value={sortKey} />
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Loja
            <select name="loja" defaultValue={searchParams.loja ?? ""} className="filter-input">
              <option value="">Todas</option>
              {PUBLIC_MARKETPLACES.map((m) => (
                <option key={m.slug} value={m.slug}>{m.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Desconto mínimo
            <select name="desc" defaultValue={searchParams.desc ?? ""} className="filter-input">
              <option value="">Qualquer</option>
              {DISCOUNTS.map((d) => (
                <option key={d} value={d}>{d}% ou mais</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Preço até (R$)
            <input
              type="number"
              name="max"
              min={0}
              step={50}
              defaultValue={searchParams.max ?? ""}
              placeholder="ex: 1000"
              className="filter-input w-32"
            />
          </label>
          <button className="btn-brand text-sm">Filtrar</button>
          {hasFilters && (
            <Link href={`/categoria/${cat.slug}?sort=${sortKey}`} className="btn-ghost text-sm">
              Limpar
            </Link>
          )}
        </form>

        <OfferGrid offers={offers} />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link href={`/categoria/${cat.slug}${baseParams({ sort: sortKey, page: page + 1 })}`} className="btn-ghost">
              Carregar mais ofertas
            </Link>
          </div>
        )}

        <style>{`.filter-input{background:var(--bg);border:1px solid var(--border);border-radius:0.6rem;padding:0.5rem 0.75rem;font-size:0.875rem;color:#e8eaed}`}</style>
      </main>
      <Footer />

      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Início", path: "/" },
            { name: cat.label, path: `/categoria/${cat.slug}` },
          ]),
          itemListLd(offers.map((o) => ({ name: o.title, path: `/oferta/${o.id}` }))),
        ]}
      />
    </>
  );
}
