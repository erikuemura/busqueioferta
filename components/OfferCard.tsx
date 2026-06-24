import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { getMarketplaceMeta } from "@/lib/categories";
import { CountdownTimer } from "./CountdownTimer";

export function OfferCard({ offer }: { offer: Offer }) {
  const market = getMarketplaceMeta(offer.marketplace);
  const lowStock = offer.stockStatus === "LOW_STOCK";

  return (
    <div className="card group flex flex-col overflow-hidden transition hover:border-brand/60">
      <Link href={`/oferta/${offer.id}`} className="relative block aspect-square overflow-hidden bg-white">
        <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-lg bg-accent px-2 py-1 text-sm font-extrabold text-white shadow">
          -{Math.round(offer.discountPercent)}%
        </span>
        {lowStock && (
          <span className="absolute right-2 top-2 rounded-lg bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-black">
            Últimas unidades
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <span
          className="w-fit rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black"
          style={{ backgroundColor: market.color }}
        >
          {market.label}
        </span>

        <Link
          href={`/oferta/${offer.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight text-gray-100 hover:text-white"
        >
          {offer.title}
        </Link>

        <div className="mt-auto">
          <p className="text-xs text-gray-500 line-through">{formatPrice(offer.originalPrice)}</p>
          <p className="text-xl font-extrabold text-brand">{formatPrice(offer.currentPrice)}</p>
        </div>

        {offer.expiresAt && (
          <div className="-mt-1">
            <CountdownTimer expiresAt={offer.expiresAt} />
          </div>
        )}

        <a
          href={`/api/track/click?offerId=${offer.id}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn-brand mt-1 w-full text-sm"
        >
          Ver Oferta
        </a>
      </div>
    </div>
  );
}
