"use client";

import { useState } from "react";
import type { Coupon } from "@prisma/client";
import { getMarketplaceMeta } from "@/lib/categories";
import { formatDateTime } from "@/lib/utils";

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const market = getMarketplaceMeta(coupon.marketplace);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase text-black"
          style={{ backgroundColor: market.color }}
        >
          {market.label}
        </span>
        {coupon.verified && <span className="text-[11px] font-semibold text-emerald-400">✓ verificado</span>}
      </div>

      <div>
        {coupon.discountText && <p className="text-lg font-extrabold text-brand">{coupon.discountText}</p>}
        <h3 className="text-sm font-medium leading-tight text-gray-100">{coupon.title}</h3>
        {coupon.description && <p className="mt-1 text-xs text-gray-400">{coupon.description}</p>}
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-dashed border-brand/50 bg-brand/5 px-3 py-2 text-center text-sm font-bold tracking-wider text-brand">
          {coupon.code}
        </code>
        <button onClick={copy} className="btn-ghost text-xs">
          {copied ? "✓" : "Copiar"}
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between">
        {coupon.expiresAt ? (
          <span className="text-[11px] text-gray-500">Válido até {formatDateTime(coupon.expiresAt)}</span>
        ) : (
          <span className="text-[11px] text-gray-500">{coupon.clicks} usos</span>
        )}
        <a
          href={`/api/track/click?couponId=${coupon.id}`}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn-brand text-xs"
        >
          Ir à loja
        </a>
      </div>
    </article>
  );
}
