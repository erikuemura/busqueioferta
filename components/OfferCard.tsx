import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { getMarketplaceMeta } from "@/lib/categories";
import { CountdownTimer } from "./CountdownTimer";
import { CardFavorite } from "./CardFavorite";

export function OfferCard({ offer }: { offer: Offer }) {
  const market = getMarketplaceMeta(offer.marketplace);
  const lowStock = offer.stockStatus === "LOW_STOCK";
  const discount = Math.round(offer.discountPercent);
  const economia = offer.originalPrice - offer.currentPrice;
  const hot = discount >= 40;
  const bestPrice = discount >= 50 || offer.featured;

  return (
    <article className="card group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-lg hover:shadow-black/30">
      <div className="absolute right-2 top-2 z-10">
        <CardFavorite offerId={offer.id} />
      </div>
      <Link href={`/oferta/${offer.id}`} className="relative block aspect-square overflow-hidden bg-white">
        <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-lg bg-accent px-2 py-1 text-sm font-extrabold text-white shadow">
          -{discount}%
        </span>
        <div className="absolute left-2 top-11 flex flex-col items-start gap-1">
          {hot && (
            <span className="rounded-md bg-orange-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
              🔥 OFERTA QUENTE
            </span>
          )}
          {bestPrice && (
            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
              🏆 MELHOR PREÇO
            </span>
          )}
          {lowStock && (
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black shadow">
              ⚡ ÚLTIMAS
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <span
            className="w-fit rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black"
            style={{ backgroundColor: market.color }}
          >
            {market.label}
          </span>
          <span className="flex items-center gap-1.5">
            {offer.notFoundCount === 0 && (
              <span className="text-[10px] font-semibold text-emerald-400" title="Disponibilidade confirmada">✓ Verificada</span>
            )}
            {offer.rating ? (
              <span className="text-[11px] font-semibold text-amber-400">★ {offer.rating.toFixed(1)}</span>
            ) : null}
          </span>
        </div>

        <Link
          href={`/oferta/${offer.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-gray-100 hover:text-white"
        >
          {offer.title}
        </Link>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <p className="text-xs text-gray-500 line-through">{formatPrice(offer.originalPrice)}</p>
            {economia > 0 && (
              <span className="rounded bg-emerald-500/15 px-1 text-[10px] font-bold text-emerald-400">
                -{formatPrice(economia)}
              </span>
            )}
          </div>
          <p className="text-xl font-extrabold text-brand">{formatPrice(offer.currentPrice)}</p>
        </div>

        {offer.expiresAt && (
          <div className="-mt-1">
            <CountdownTimer expiresAt={offer.expiresAt} />
          </div>
        )}

        {offer.clicks > 0 && (
          <p className="text-[11px] text-gray-500">
            🔥 {offer.clicks}{" "}
            {offer.clicks === 1 ? "pessoa já foi" : "pessoas já foram"} à oferta
          </p>
        )}

        <a
          href={`/api/track/click?offerId=${offer.id}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn-brand mt-1 w-full text-sm"
        >
          Pegar oferta
        </a>
      </div>
    </article>
  );
}
