import Link from "next/link";
import type { Metadata } from "next";
import type { Offer, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/CategoryNav";
import { OfferGrid } from "@/components/OfferGrid";
import { SEO_TERMS } from "@/lib/terms";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 24;

const SORTS: Record<string, Prisma.OfferOrderByWithRelationInput> = {
  relevancia: { score: "desc" },
  desconto: { discountPercent: "desc" },
  preco: { currentPrice: "asc" },
};

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  const q = searchParams.q?.trim();
  return buildMetadata({
    title: q ? `Buscar "${q}"` : "Buscar ofertas",
    description: q ? `Resultados de busca para "${q}" — ofertas e promoções com desconto.` : "Busque ofertas e promoções.",
    path: q ? `/busca?q=${encodeURIComponent(q)}` : "/busca",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; sort?: string; page?: string } }) {
  const q = searchParams.q?.trim();
  const sortKey = searchParams.sort && SORTS[searchParams.sort] ? searchParams.sort : "relevancia";
  const page = Math.max(1, Number(searchParams.page) || 1);

  let offers: Offer[] = [];
  let total = 0;
  if (q) {
    const where: Prisma.OfferWhereInput = { status: "ACTIVE", title: { contains: q, mode: "insensitive" } };
    try {
      [offers, total] = await Promise.all([
        prisma.offer.findMany({ where, orderBy: SORTS[sortKey], take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
        prisma.offer.count({ where }),
      ]);
    } catch {
      /* sem banco */
    }
  }

  const hasMore = page * PAGE_SIZE < total;

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <div className="mb-5">
          <CategoryNav />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">
            {q ? <>Resultados para “{q}”</> : "Buscar ofertas"}{" "}
            {q && <span className="text-sm font-normal text-gray-500">({total})</span>}
          </h1>
          {q && (
            <div className="flex gap-1.5">
              {Object.keys(SORTS).map((key) => (
                <Link
                  key={key}
                  href={`/busca?q=${encodeURIComponent(q)}&sort=${key}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                    key === sortKey ? "bg-brand text-white" : "border border-[var(--border)] text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {key}
                </Link>
              ))}
            </div>
          )}
        </div>

        {!q ? (
          <div className="card p-8 text-center text-gray-400">
            Digite algo na busca acima. Ou explore os mais buscados:
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SEO_TERMS.slice(0, 8).map((t) => (
                <Link key={t.slug} href={`/ofertas/${t.slug}`} className="chip">{t.label}</Link>
              ))}
            </div>
          </div>
        ) : total === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-2 text-gray-300">Nenhuma oferta encontrada para “{q}”.</p>
            <p className="text-sm text-gray-500">Tente outro termo ou veja as ofertas em destaque.</p>
            <Link href="/" className="btn-brand mt-4 inline-flex">Ver ofertas</Link>
          </div>
        ) : (
          <OfferGrid offers={offers} />
        )}

        {hasMore && q && (
          <div className="mt-8 flex justify-center">
            <Link href={`/busca?q=${encodeURIComponent(q)}&sort=${sortKey}&page=${page + 1}`} className="btn-ghost">
              Carregar mais
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
