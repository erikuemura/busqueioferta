"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Offer } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { getCategoryMeta, getMarketplaceMeta } from "@/lib/categories";
import { CountdownTimer } from "./CountdownTimer";

const ROTATE_MS = 5000;

export function HotDealsCarousel({ offers }: { offers: Offer[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = offers.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative mb-8 overflow-hidden rounded-3xl border border-[var(--border)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {offers.map((offer) => (
          <Slide key={offer.id} offer={offer} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="Próximo"
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Ir ao slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Slide({ offer }: { offer: Offer }) {
  const cat = getCategoryMeta(offer.category);
  const market = getMarketplaceMeta(offer.marketplace);
  const discount = Math.round(offer.discountPercent);
  const economia = offer.originalPrice - offer.currentPrice;

  return (
    <div
      className="relative w-full shrink-0"
      style={{ background: `linear-gradient(110deg, ${cat.gradient[1]} 0%, ${cat.gradient[0]} 100%)` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="relative grid min-h-[300px] grid-cols-1 items-center gap-4 px-6 py-8 sm:min-h-[360px] sm:grid-cols-2 sm:px-12">
        {/* Texto */}
        <div className="order-2 sm:order-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-white shadow">
              🔥 OFERTA QUENTE · -{discount}%
            </span>
            <span
              className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase text-black"
              style={{ backgroundColor: market.color }}
            >
              {market.label}
            </span>
          </div>

          <h2 className="mt-3 line-clamp-2 text-2xl font-extrabold leading-tight text-white drop-shadow sm:text-3xl">
            {offer.title}
          </h2>

          <div className="mt-3 flex items-end gap-3">
            <span className="text-base text-white/70 line-through">{formatPrice(offer.originalPrice)}</span>
            {economia > 0 && (
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-white">
                economize {formatPrice(economia)}
              </span>
            )}
          </div>
          <p className="text-4xl font-black text-white drop-shadow sm:text-5xl">
            {formatPrice(offer.currentPrice)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={`/api/track/click?offerId=${offer.id}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-gray-900 shadow-lg transition hover:scale-[1.02] active:scale-95"
            >
              🛒 Pegar oferta
            </a>
            <Link
              href={`/oferta/${offer.id}`}
              className="rounded-xl border border-white/40 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Ver detalhes
            </Link>
            {offer.expiresAt && (
              <span className="rounded-lg bg-black/30 px-2 py-1">
                <CountdownTimer expiresAt={offer.expiresAt} />
              </span>
            )}
          </div>
        </div>

        {/* Imagem */}
        <Link
          href={`/oferta/${offer.id}`}
          className="order-1 mx-auto block aspect-square w-40 overflow-hidden rounded-2xl bg-white shadow-2xl sm:order-2 sm:ml-auto sm:mr-0 sm:w-64"
        >
          <div className="relative h-full w-full">
            <Image
              src={offer.imageUrl}
              alt={offer.title}
              fill
              sizes="(max-width:768px) 160px, 256px"
              className="object-contain p-2"
              priority
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
