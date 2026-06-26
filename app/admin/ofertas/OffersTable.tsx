"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Offer } from "@prisma/client";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getMarketplaceMeta } from "@/lib/categories";
import { archiveOfferAction, bulkArchiveAction, publishToSocialAction, broadcastWhatsappAction } from "../actions";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  DRAFT: "bg-gray-500/15 text-gray-300",
  EXPIRED: "bg-red-500/15 text-red-400",
  OUT_OF_STOCK: "bg-amber-500/15 text-amber-400",
  ARCHIVED: "bg-zinc-700/40 text-zinc-400",
};

export function OffersTable({ offers }: { offers: Offer[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [broadcastMsg, setBroadcastMsg] = useState("");

  function broadcast(id: string) {
    setBroadcastMsg("Enviando…");
    startTransition(async () => {
      const r = await broadcastWhatsappAction(id);
      setBroadcastMsg(
        r.total === 0
          ? "Nenhum cliente com esse interesse + WhatsApp ainda."
          : `${r.dryRun ? "Enfileirado (API WhatsApp não configurada): " : ""}${r.sent} enviado(s), ${r.skipped} já recebidos, ${r.failed} falha(s) de ${r.total} cliente(s).`,
      );
    });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === offers.length ? new Set() : new Set(offers.map((o) => o.id))));
  }

  if (offers.length === 0) {
    return <p className="card p-8 text-center text-gray-500">Nenhuma oferta encontrada com esses filtros.</p>;
  }

  return (
    <div className="space-y-3">
      {broadcastMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          📲 {broadcastMsg}
          <button onClick={() => setBroadcastMsg("")} className="ml-auto text-emerald-400/70 hover:text-emerald-300">✕</button>
        </div>
      )}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/40 bg-brand/10 px-4 py-2 text-sm">
          <span>{selected.size} selecionada(s)</span>
          <button
            disabled={pending}
            onClick={() => startTransition(async () => {
              await bulkArchiveAction([...selected]);
              setSelected(new Set());
            })}
            className="btn-ghost ml-auto text-xs"
          >
            Arquivar em lote
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-[var(--border)] text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">
                <input type="checkbox" checked={selected.size === offers.length} onChange={toggleAll} />
              </th>
              <th className="p-3">Título</th>
              <th className="p-3">Marketplace</th>
              <th className="p-3">Desconto</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Validade</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-white/5">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                </td>
                <td className="max-w-[260px] p-3">
                  <Link href={`/admin/ofertas/${o.id}/editar`} className="line-clamp-1 font-medium hover:text-brand">
                    {o.title}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {o.clicks} cliques · {o.shares} shares
                  </span>
                </td>
                <td className="p-3">
                  <span className="rounded px-1.5 py-0.5 text-xs font-bold text-black" style={{ backgroundColor: getMarketplaceMeta(o.marketplace).color }}>
                    {getMarketplaceMeta(o.marketplace).label}
                  </span>
                </td>
                <td className="p-3 font-bold text-accent">-{Math.round(o.discountPercent)}%</td>
                <td className="p-3">{formatPrice(o.currentPrice)}</td>
                <td className="p-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-400">{o.expiresAt ? formatDateTime(o.expiresAt) : "—"}</td>
                <td className="p-3">
                  <div className="flex gap-2 text-xs">
                    <Link href={`/admin/ofertas/${o.id}/editar`} className="text-gray-300 hover:text-brand">
                      Editar
                    </Link>
                    <button
                      disabled={pending}
                      onClick={() => startTransition(() => publishToSocialAction(o.id, ["WHATSAPP", "INSTAGRAM"]))}
                      className="text-gray-300 hover:text-brand"
                    >
                      Publicar
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => broadcast(o.id)}
                      className="font-medium text-emerald-400 hover:text-emerald-300"
                      title="Enviar esta oferta no WhatsApp dos clientes do nicho"
                    >
                      📲 Clientes
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => startTransition(() => archiveOfferAction(o.id))}
                      className="text-gray-300 hover:text-accent"
                    >
                      Arquivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
