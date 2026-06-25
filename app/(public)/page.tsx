import Link from "next/link";
import Image from "next/image";
import type { Coupon, Offer, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryNav } from "@/components/CategoryNav";
import { OfferGrid } from "@/components/OfferGrid";
import { OfferCard } from "@/components/OfferCard";
import { CouponCard } from "@/components/CouponCard";
import { HotDealsCarousel } from "@/components/HotDealsCarousel";
import { formatPrice } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 900; // ISR 15min

export const metadata = { alternates: { canonical: absoluteUrl("/") } };

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

  // Resiliente: se o banco estiver indisponível (ex.: DATABASE_URL ainda não
  // configurada no deploy), mostra o layout com estado vazio em vez de quebrar.
  let featured: Offer[] = [];
  let offers: Offer[] = [];
  let total = 0;
  let mostClicked: Offer[] = [];
  let coupons: Coupon[] = [];
  let hotDeals: Offer[] = [];
  try {
    [featured, offers, total, mostClicked, coupons, hotDeals] = await Promise.all([
      q
        ? Promise.resolve<Offer[]>([])
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
      q
        ? Promise.resolve<Offer[]>([])
        : prisma.offer.findMany({ where: { status: "ACTIVE", clicks: { gt: 0 } }, orderBy: { clicks: "desc" }, take: 8 }),
      q
        ? Promise.resolve<Coupon[]>([])
        : prisma.coupon.findMany({
            where: { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
            orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
            take: 6,
          }),
      q
        ? Promise.resolve<Offer[]>([])
        : prisma.offer.findMany({
            where: { status: "ACTIVE", discountPercent: { gte: 25 } },
            orderBy: [{ featured: "desc" }, { discountPercent: "desc" }],
            take: 6,
          }),
    ]);
  } catch (err) {
    console.error("[home] falha ao carregar ofertas:", (err as Error).message);
  }

  const hasMore = page * PAGE_SIZE < total;

  return (
    <>
      <Header />
      <main className="container-page py-6">
        {!q && hotDeals.length > 0 && <HotDealsCarousel offers={hotDeals} />}

        {!q && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm text-gray-300">
            <span className="inline-flex items-center gap-1.5"><strong className="text-white">{total}+</strong> ofertas ativas</span>
            <span className="text-gray-600">·</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-white">{coupons.length}+</strong> cupons válidos</span>
            <span className="text-gray-600">·</span>
            <span className="inline-flex items-center gap-1.5">🏪 7 marketplaces</span>
            <span className="text-gray-600">·</span>
            <span className="inline-flex items-center gap-1.5">✅ link verificado</span>
            <span className="text-gray-600">·</span>
            <span className="inline-flex items-center gap-1.5">⏱ atualizado a cada 2h</span>
          </div>
        )}

        {!q && featured.length > 0 && (
          <section className="mb-10">
            <h2 className="section-title mb-4">Ofertas do dia</h2>
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
          <h1 className="section-title">
            {q ? `Resultados para “${q}”` : "Ofertas em destaque"}
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

        {!q && mostClicked.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Mais acessadas</h2>
              <span className="hidden text-sm text-gray-500 sm:block">As ofertas que mais geraram cliques</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {mostClicked.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        )}

        {!q && coupons.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="section-title">Cupons populares</h2>
              <Link href="/cupons" className="text-sm font-medium text-brand hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <CouponCard key={c.id} coupon={c} />
              ))}
            </div>
          </section>
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
