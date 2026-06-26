"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface Suggestion {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  discountPercent: number;
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/offers?q=${encodeURIComponent(term)}&limit=6`, { signal: ctrl.signal });
        const data = await res.json();
        setItems(data.offers ?? []);
        setOpen(true);
      } catch {
        /* abortado */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/busca?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative ml-auto flex-1 sm:ml-2 sm:max-w-xl">
      <form onSubmit={submit}>
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          placeholder="Buscar produtos, marcas e ofertas..."
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-500 transition focus:border-brand focus:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-label="Buscar"
          autoComplete="off"
        />
      </form>

      {open && (loading || items.length > 0) && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl">
          {loading && items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Buscando…</p>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {items.map((it) => (
                <li key={it.id}>
                  <a
                    href={`/oferta/${it.id}`}
                    className="flex items-center gap-3 px-3 py-2 transition hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={it.imageUrl} alt="" fill className="object-contain" sizes="40px" unoptimized />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm text-gray-100">{it.title}</span>
                      <span className="text-xs font-bold text-brand">{formatPrice(it.currentPrice)}</span>
                      <span className="ml-1 text-xs font-semibold text-accent">-{Math.round(it.discountPercent)}%</span>
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={submit}
                  className="w-full bg-white/[0.03] px-4 py-2.5 text-left text-sm font-medium text-brand hover:bg-white/[0.06]"
                >
                  Ver todos os resultados para “{q.trim()}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
