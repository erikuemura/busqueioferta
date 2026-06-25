"use client";

import { useState } from "react";
import Image from "next/image";
import type { Offer } from "@prisma/client";
import { CATEGORIES, MARKETPLACES } from "@/lib/categories";
import { formatPrice, calcDiscountPercent } from "@/lib/utils";
import { saveOfferAction } from "../actions";

const STATUSES = ["ACTIVE", "DRAFT", "EXPIRED", "OUT_OF_STOCK", "ARCHIVED"];
const STOCK = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"];

export function OfferForm({ offer }: { offer?: Offer }) {
  const [title, setTitle] = useState(offer?.title ?? "");
  const [imageUrl, setImageUrl] = useState(offer?.imageUrl ?? "");
  const [originalPrice, setOriginalPrice] = useState(offer?.originalPrice ?? 0);
  const [currentPrice, setCurrentPrice] = useState(offer?.currentPrice ?? 0);
  const discount = calcDiscountPercent(originalPrice, currentPrice);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form action={saveOfferAction} className="space-y-4">
        {offer && <input type="hidden" name="id" value={offer.id} />}

        <Field label="Título">
          <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>

        <Field label="Descrição / chamada (aparece no compartilhamento)">
          <textarea name="description" defaultValue={offer?.description ?? ""} rows={3} className="input" />
        </Field>

        <Field label="URL da imagem">
          <input name="imageUrl" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Preço original">
            <input
              name="originalPrice"
              type="number"
              step="0.01"
              required
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Preço atual">
            <input
              name="currentPrice"
              type="number"
              step="0.01"
              required
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Desconto (auto)">
            <input value={`${discount}%`} disabled className="input opacity-70" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Marketplace">
            <select name="marketplace" defaultValue={offer?.marketplace ?? "MANUAL"} className="input">
              {MARKETPLACES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Categoria">
            <select name="category" defaultValue={offer?.category ?? "OUTROS"} className="input">
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="URL de afiliado">
          <input name="affiliateUrl" required defaultValue={offer?.affiliateUrl ?? ""} className="input" />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Status">
            <select name="status" defaultValue={offer?.status ?? "ACTIVE"} className="input">
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Estoque">
            <select name="stockStatus" defaultValue={offer?.stockStatus ?? "IN_STOCK"} className="input">
              {STOCK.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Expira em">
            <input
              name="expiresAt"
              type="datetime-local"
              defaultValue={offer?.expiresAt ? toLocalInput(offer.expiresAt) : ""}
              className="input"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={offer?.featured} />
          Destaque (aparece no banner da home)
        </label>

        <button className="btn-brand">{offer ? "Salvar alterações" : "Criar oferta"}</button>

        <style>{`.input{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:0.6rem;padding:0.55rem 0.75rem;font-size:0.9rem;color:#e8eaed}`}</style>
      </form>

      {/* Preview */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Preview do card</p>
          <div className="card overflow-hidden">
            <div className="relative aspect-square bg-white">
              {imageUrl ? (
                <Image src={imageUrl} alt="preview" fill className="object-contain" sizes="320px" unoptimized />
              ) : (
                <div className="grid h-full place-items-center text-gray-400">sem imagem</div>
              )}
              {discount > 0 && (
                <span className="absolute left-2 top-2 rounded bg-accent px-2 py-1 text-sm font-extrabold text-white">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="line-clamp-2 text-sm">{title || "Título do produto"}</p>
              <p className="text-xs text-gray-500 line-through">{formatPrice(originalPrice || 0)}</p>
              <p className="text-lg font-extrabold text-brand">{formatPrice(currentPrice || 0)}</p>
            </div>
          </div>
        </div>

        {offer && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Arte para Instagram/WhatsApp</p>
            {/* gerada pelo Sharp via API (PNG dinâmico — não otimizar com next/image) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/social/${offer.id}/image?format=square`}
              alt="arte social"
              className="w-full rounded-xl border border-[var(--border)]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function toLocalInput(date: Date): string {
  const d = new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}
