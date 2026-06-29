import Link from "next/link";
import Image from "next/image";
import type { Offer } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { getMarketplaceMeta } from "@/lib/categories";
import { tempClass, tempLabel } from "@/lib/temperature";

const MEDALS = ["🥇", "🥈", "🥉"];

export function HotRanking({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title text-orange-400">🔥 Mais quentes</h2>
        <span className="hidden text-sm text-gray-500 sm:block">As ofertas mais votadas pela comunidade</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {offers.map((offer, i) => {
          const market = getMarketplaceMeta(offer.marketplace);
          return (
            <Link
              key={offer.id}
              href={`/oferta/${offer.id}`}
              className="card group flex items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:border-brand/60"
            >
              <span className="w-7 shrink-0 text-center text-lg font-black text-gray-600">
                {MEDALS[i] ?? `#${i + 1}`}
              </span>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image src={offer.imageUrl} alt={offer.title} fill className="object-contain" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-gray-100 group-hover:text-white">{offer.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-base font-extrabold text-brand">{formatPrice(offer.currentPrice)}</span>
                  <span className="rounded bg-accent/15 px-1 text-[11px] font-bold text-accent">
                    -{Math.round(offer.discountPercent)}%
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                  <span className={`font-bold ${tempClass(offer.temperature)}`}>🔥 {tempLabel(offer.temperature)}</span>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500">{market.label}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
