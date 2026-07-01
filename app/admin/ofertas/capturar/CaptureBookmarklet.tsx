"use client";

import { useState, useTransition } from "react";
import { regenerateCaptureTokenAction } from "../../actions";

export function CaptureBookmarklet({ bookmarklet, hasToken }: { bookmarklet: string | null; hasToken: boolean }) {
  const [pending, start] = useTransition();
  const [justGenerated, setJustGenerated] = useState(false);

  function generate() {
    start(async () => {
      await regenerateCaptureTokenAction();
      setJustGenerated(true);
    });
  }

  return (
    <div className="card p-5">
      {!hasToken ? (
        <div>
          <p className="mb-3 text-sm text-gray-400">
            Nenhum token de captura ainda. Gere um para liberar o bookmarklet.
          </p>
          <button onClick={generate} disabled={pending} className="btn-brand text-sm disabled:opacity-60">
            {pending ? "Gerando…" : "Gerar token e bookmarklet"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={bookmarklet ?? "#"}
            onClick={(e) => e.preventDefault()}
            draggable
            className="cursor-grab select-none rounded-xl bg-brand-gradient px-5 py-3 font-bold text-white shadow-lg active:cursor-grabbing"
            title="Arraste para a barra de favoritos"
          >
            🔖 Capturar para busqueioferta
          </a>
          <p className="text-sm text-gray-400">← arraste este botão para a barra de favoritos do navegador</p>
          <button onClick={generate} disabled={pending} className="btn-ghost ml-auto text-xs">
            {pending ? "Gerando…" : "Gerar novo token (revoga o antigo)"}
          </button>
          {justGenerated && <p className="w-full text-xs text-emerald-400">✓ Token gerado — arraste o botão atualizado.</p>}
        </div>
      )}
    </div>
  );
}
