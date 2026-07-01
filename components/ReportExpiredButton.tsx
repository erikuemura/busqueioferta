"use client";

import { useState } from "react";

export function ReportExpiredButton({ offerId }: { offerId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");

  async function report() {
    setState("sending");
    try {
      const res = await fetch("/api/report-expired", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();
      setState(data.alreadyReported ? "already" : "done");
    } catch {
      setState("idle");
    }
  }

  if (state === "done" || state === "already") {
    return (
      <p className="text-xs text-emerald-400">
        {state === "already" ? "Você já avisou sobre essa oferta." : "Obrigado! Vamos verificar."}
      </p>
    );
  }

  return (
    <button
      onClick={report}
      disabled={state === "sending"}
      className="text-xs text-gray-500 underline decoration-dotted hover:text-gray-300 disabled:opacity-60"
    >
      {state === "sending" ? "Enviando…" : "🚫 Essa oferta expirou ou não está mais disponível?"}
    </button>
  );
}
