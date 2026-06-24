"use client";

import { useState, useTransition } from "react";
import { triggerAutoPublishAction } from "../actions";

export function AutoPublishButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  function run() {
    start(async () => {
      const results = await triggerAutoPublishAction();
      const total = results.reduce((s, r) => s + r.queued, 0);
      setMsg(
        total === 0
          ? "Nada para publicar agora (sem credenciais, limite diário atingido ou sem ofertas elegíveis)."
          : `${total} post(s) agendado(s): ` + results.map((r) => `${r.platform} ${r.queued}`).join(", "),
      );
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={run} disabled={pending} className="btn-brand text-sm disabled:opacity-60">
        {pending ? "Selecionando..." : "⚡ Publicar automaticamente agora"}
      </button>
      {msg && <span className="text-sm text-gray-400">{msg}</span>}
    </div>
  );
}
