import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/CategoryNav";
import { OfferGrid } from "@/components/OfferGrid";
import { formatPrice } from "@/lib/utils";

export const revalidate = 900; // ISR 15min

const PAGE_SIZE = 16;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = searchParams.q?.trim();
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.OfferWhereInput = {
    status: "ACTIVE",
    ...(q
      ? { title: { contains: q, mode: "insensitive" } }
      : {}),
  };

  const [featured, offers, total] = await Promise.all([
    q
      ? Promise.resolve([])
      : prisma.offer.findMany({
          where: { status: "ACTIVE", featured: true },
          orderBy: { score: "desc" },
          take: 5,
        }),
    prisma.offer.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
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
        {!q && featured.length > 0 && (
          <section className="mb-8">
            <div className="grid gap-3 md:grid-cols-2">
              <FeaturedHero offer={featured[0]} />
              <div className="grid grid-cols-2 gap-3">
                {featured.slice(1, 5).map((o) => (
                  <FeaturedMini key={o.id} offer={o} />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mb-5">
          <CategoryNav />
        </div>

        <div className="mb-4 flex items-end justify-between">
          <h1 className="text-xl font-bold">
            {q ? `Resultados para “${q}”` : "🔥 Ofertas em destaque"}
          </h1>
          <span className="text-sm text-gray-500">{total} ofertas</span>
        </div>

        <OfferGrid offers={offers} />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link
              href={{ pathname: "/", query: { ...(q ? { q } : {}), page: page + 1 } }}
              className="btn-ghost"
            >
              Carregar mais ofertas
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function FeaturedHero({ offer }: { offer: { id: string; title: string; imageUrl: string; currentPrice: number; originalPrice: number; discountPercent: number } }) {
  return (
    <Link
      href={`/oferta/${offer.id}`}
      className="card relative flex min-h-[260px] items-center gap-4 overflow-hidden p-5"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent" />
      <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-white">
        <Image src={offer.imageUrl} alt={offer.title} fill className="object-contain" sizes="160px" />
      </div>
      <div className="relative">
        <span className="rounded-lg bg-accent px-2 py-1 text-sm font-extrabold text-white">
          OFERTA DO DIA · -{Math.round(offer.discountPercent)}%
        </span>
        <h2 className="mt-3 text-lg font-bold leading-tight">{offer.title}</h2>
        <p className="mt-2 text-sm text-gray-400 line-through">{formatPrice(offer.originalPrice)}</p>
        <p className="text-3xl font-extrabold text-brand">{formatPrice(offer.currentPrice)}</p>
      </div>
    </Link>
  );
}

function FeaturedMini({ offer }: { offer: { id: string; title: string; imageUrl: string; currentPrice: number; discountPercent: number } }) {
  return (
    <Link href={`/oferta/${offer.id}`} className="card flex flex-col gap-1 p-3">
      <div className="relative h-20 w-full overflow-hidden rounded-lg bg-white">
        <Image src={offer.imageUrl} alt={offer.title} fill className="object-contain" sizes="200px" />
      </div>
      <span className="text-xs font-bold text-accent">-{Math.round(offer.discountPercent)}%</span>
      <p className="line-clamp-2 text-xs text-gray-200">{offer.title}</p>
      <p className="text-sm font-bold text-brand">{formatPrice(offer.currentPrice)}</p>
    </Link>
  );
}
