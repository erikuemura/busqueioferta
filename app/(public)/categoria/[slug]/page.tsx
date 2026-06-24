import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/categories";
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};
  return { title: `Ofertas de ${cat.label}`, description: `As melhores ofertas de ${cat.label} dos principais marketplaces.` };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string; page?: string };
}) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const sortKey = searchParams.sort && SORTS[searchParams.sort] ? searchParams.sort : "desconto";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where = { status: "ACTIVE" as const, category: cat.value };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: SORTS[sortKey].orderBy,
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.offer.count({ where }),
  ]);

  const hasMore = page * PAGE_SIZE < total;

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
          <div className="flex gap-1.5">
            {Object.entries(SORTS).map(([key, { label }]) => (
              <Link
                key={key}
                href={`/categoria/${cat.slug}?sort=${key}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  key === sortKey ? "bg-brand text-white" : "border border-[var(--border)] text-gray-300 hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <OfferGrid offers={offers} />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link href={`/categoria/${cat.slug}?sort=${sortKey}&page=${page + 1}`} className="btn-ghost">
              Carregar mais ofertas
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
