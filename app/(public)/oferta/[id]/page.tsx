import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getCategoryMeta, getMarketplaceMeta } from "@/lib/categories";
import { offerToVars, renderTemplate, whatsappShareUrl } from "@/lib/social/whatsapp";
import { getSetting } from "@/lib/settings";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferCard } from "@/components/OfferCard";
import { ShareButtons } from "@/components/ShareButtons";
import { CountdownTimer } from "@/components/CountdownTimer";

export const revalidate = 900;

async function getOffer(id: string) {
  try {
    return await prisma.offer.findUnique({ where: { id }, include: { tags: true } });
  } catch (err) {
    console.error("[oferta] falha ao carregar:", (err as Error).message);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const offer = await getOffer(params.id);
  if (!offer) return {};
  const title = `${offer.title} por ${formatPrice(offer.currentPrice)}`;
  return {
    title,
    description: `${Math.round(offer.discountPercent)}% OFF na ${getMarketplaceMeta(offer.marketplace).label}. De ${formatPrice(offer.originalPrice)} por ${formatPrice(offer.currentPrice)}.`,
    openGraph: {
      title,
      images: [{ url: offer.imageUrl, width: 800, height: 800, alt: offer.title }],
      type: "website",
    },
  };
}

export default async function OfferPage({ params }: { params: { id: string } }) {
  const offer = await getOffer(params.id);
  if (!offer) notFound();

  const market = getMarketplaceMeta(offer.marketplace);
  const cat = getCategoryMeta(offer.category);

  const template = await getSetting("whatsappTemplate");
  const message = renderTemplate(template, offerToVars(offer));
  const waUrl = whatsappShareUrl(message);

  const related = await prisma.offer
    .findMany({
      where: { status: "ACTIVE", category: offer.category, id: { not: offer.id } },
      orderBy: { score: "desc" },
      take: 4,
    })
    .catch(() => []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offer.title,
    image: offer.imageUrl,
    description: offer.description ?? offer.title,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: offer.currentPrice,
      availability:
        offer.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${siteUrl}/oferta/${offer.id}`,
    },
    ...(offer.rating && offer.reviewCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: offer.rating, reviewCount: offer.reviewCount } }
      : {}),
  };

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">
            Início
          </Link>{" "}
          /{" "}
          <Link href={`/categoria/${cat.slug}`} className="hover:text-white">
            {cat.label}
          </Link>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card relative aspect-square overflow-hidden bg-white">
            <Image src={offer.imageUrl} alt={offer.title} fill className="object-contain p-4" sizes="(max-width:768px) 100vw, 50vw" priority />
            <span className="absolute left-3 top-3 rounded-lg bg-accent px-3 py-1.5 text-lg font-extrabold text-white">
              -{Math.round(offer.discountPercent)}%
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-md px-2 py-1 text-xs font-bold uppercase text-black" style={{ backgroundColor: market.color }}>
              {market.label}
            </span>
            <h1 className="text-2xl font-bold leading-tight">{offer.title}</h1>

            {offer.rating && (
              <p className="text-sm text-amber-400">
                ★ {offer.rating.toFixed(1)}{" "}
                <span className="text-gray-500">({offer.reviewCount} avaliações)</span>
              </p>
            )}

            <div className="card p-4">
              <p className="text-sm text-gray-400 line-through">{formatPrice(offer.originalPrice)}</p>
              <p className="text-4xl font-extrabold text-brand">{formatPrice(offer.currentPrice)}</p>
              <p className="mt-1 text-sm text-emerald-400">
                Você economiza {formatPrice(offer.originalPrice - offer.currentPrice)}
              </p>
              {offer.stockStatus === "LOW_STOCK" && (
                <p className="mt-2 text-sm font-semibold text-amber-400">⚠ Últimas unidades!</p>
              )}
              {offer.expiresAt && (
                <p className="mt-2 text-sm">
                  Termina em: <CountdownTimer expiresAt={offer.expiresAt} />
                </p>
              )}
            </div>

            <a
              href={`/api/track/click?offerId=${offer.id}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="btn-brand w-full py-3.5 text-lg"
            >
              🛒 Ver oferta na {market.label}
            </a>

            <ShareButtons offerId={offer.id} whatsappUrl={waUrl} affiliateUrl={offer.affiliateUrl} />

            {offer.description && (
              <div className="card p-4 text-sm leading-relaxed text-gray-300">{offer.description}</div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Produtos relacionados</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    </>
  );
}
