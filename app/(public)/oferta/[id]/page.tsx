import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getCategoryMeta, getMarketplaceMeta } from "@/lib/categories";
import { offerToVars, renderTemplate, whatsappShareUrl } from "@/lib/social/whatsapp";
import { absoluteUrl, breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { getSetting } from "@/lib/settings";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferCard } from "@/components/OfferCard";
import { ShareButtons } from "@/components/ShareButtons";
import { FavoriteButton } from "@/components/FavoriteButton";
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
  // Imagem de preview gerada dinamicamente (card de marca) — preview rico no WhatsApp/redes.
  const ogImage = absoluteUrl(`/api/social/${offer.id}/image?format=landscape`);
  return {
    title,
    description: `${Math.round(offer.discountPercent)}% OFF na ${getMarketplaceMeta(offer.marketplace).label}. De ${formatPrice(offer.originalPrice)} por ${formatPrice(offer.currentPrice)}.`,
    alternates: { canonical: absoluteUrl(`/oferta/${offer.id}`) },
    openGraph: {
      title,
      url: absoluteUrl(`/oferta/${offer.id}`),
      images: [{ url: ogImage, width: 1200, height: 630, alt: offer.title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

const TRUST = [
  { icon: "✅", label: "Link verificado" },
  { icon: "🏪", label: "Loja oficial" },
  { icon: "⏱", label: "Preço atualizado" },
  { icon: "🔒", label: "Compra segura" },
];

export default async function OfferPage({ params }: { params: { id: string } }) {
  const offer = await getOffer(params.id);
  if (!offer) notFound();

  const market = getMarketplaceMeta(offer.marketplace);
  const cat = getCategoryMeta(offer.category);
  const discount = Math.round(offer.discountPercent);
  const economia = offer.originalPrice - offer.currentPrice;

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
        offer.stockStatus === "OUT_OF_STOCK" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: absoluteUrl(`/oferta/${offer.id}`),
    },
    ...(offer.rating && offer.reviewCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: offer.rating, reviewCount: offer.reviewCount } }
      : {}),
  };

  return (
    <>
      <Header />
      <main className="container-page py-6 pb-28 md:pb-6">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link>{" / "}
          <Link href={`/categoria/${cat.slug}`} className="hover:text-white">{cat.label}</Link>
        </nav>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card relative aspect-square overflow-hidden bg-white">
            <Image src={offer.imageUrl} alt={offer.title} fill className="object-contain p-6" sizes="(max-width:768px) 100vw, 50vw" priority />
            <span className="absolute left-3 top-3 rounded-xl bg-accent px-3 py-1.5 text-lg font-extrabold text-white shadow">
              -{discount}%
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md px-2 py-1 text-xs font-bold uppercase text-black" style={{ backgroundColor: market.color }}>
                {market.label}
              </span>
              {offer.rating ? (
                <span className="text-sm font-semibold text-amber-400">
                  ★ {offer.rating.toFixed(1)} <span className="font-normal text-gray-500">({offer.reviewCount})</span>
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{offer.title}</h1>

            <div className="card p-5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">{formatPrice(offer.originalPrice)}</span>
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-bold text-white">-{discount}%</span>
              </div>
              <p className="mt-1 text-4xl font-black text-brand sm:text-5xl">{formatPrice(offer.currentPrice)}</p>
              {economia > 0 && (
                <p className="mt-1 text-sm font-semibold text-emerald-400">
                  💰 Você economiza {formatPrice(economia)}
                </p>
              )}
              {offer.stockStatus === "LOW_STOCK" && (
                <p className="mt-2 text-sm font-semibold text-amber-400">⚠ Últimas unidades!</p>
              )}
              {offer.expiresAt && (
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                  Termina em <CountdownTimer expiresAt={offer.expiresAt} />
                </p>
              )}

              <a
                href={`/api/track/click?offerId=${offer.id}`}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="btn-brand mt-4 w-full py-3.5 text-lg"
              >
                🛒 Pegar oferta na {market.label}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TRUST.map((t) => (
                <div key={t.label} className="card flex items-center gap-2 px-3 py-2 text-xs text-gray-300">
                  <span>{t.icon}</span> {t.label}
                </div>
              ))}
            </div>
            {offer.notFoundCount === 0 && (
              <p className="text-xs text-emerald-400">
                ✓ Disponibilidade verificada — última checagem em {formatDateTime(offer.updatedAt)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <FavoriteButton offerId={offer.id} />
              <ShareButtons
                offerId={offer.id}
                whatsappUrl={waUrl}
                affiliateUrl={offer.affiliateUrl}
                shareUrl={absoluteUrl(`/oferta/${offer.id}`)}
                title={`${offer.title} por ${formatPrice(offer.currentPrice)} (-${discount}%)`}
              />
            </div>

            {offer.description && (
              <div className="card p-4 text-sm leading-relaxed text-gray-300">
                <h2 className="mb-2 font-semibold text-white">Sobre o produto</h2>
                {offer.description}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Produtos relacionados</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Barra de compra fixa no mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 p-3 backdrop-blur md:hidden">
        <div className="container-page flex items-center gap-3">
          <div className="leading-tight">
            <p className="text-xs text-gray-500 line-through">{formatPrice(offer.originalPrice)}</p>
            <p className="text-lg font-extrabold text-brand">{formatPrice(offer.currentPrice)}</p>
          </div>
          <a
            href={`/api/track/click?offerId=${offer.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-brand ml-auto flex-1 py-3"
          >
            🛒 Pegar oferta
          </a>
        </div>
      </div>

      <Footer />

      <JsonLd
        data={[
          productLd,
          breadcrumbLd([
            { name: "Início", path: "/" },
            { name: cat.label, path: `/categoria/${cat.slug}` },
            { name: offer.title, path: `/oferta/${offer.id}` },
          ]),
        ]}
      />
    </>
  );
}
