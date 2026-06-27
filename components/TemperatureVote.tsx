"use client";

import { useEffect, useState } from "react";
import { tempClass, tempLabel } from "@/lib/temperature";

export function TemperatureVote({ offerId, initial }: { offerId: string; initial: number }) {
  const [temp, setTemp] = useState(initial);
  const [myVote, setMyVote] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/vote?offerId=${offerId}`)
      .then((r) => r.json())
      .then((d) => {
        setTemp(d.temperature ?? initial);
        setMyVote(d.myVote ?? 0);
      })
      .catch(() => {});
  }, [offerId, initial]);

  async function vote(value: 1 | -1) {
    setBusy(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, value }),
      });
      const d = await res.json();
      if (res.ok) {
        setTemp(d.temperature);
        setMyVote(d.myVote);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="text-center">
        <p className={`text-3xl font-black leading-none ${tempClass(temp)}`}>{tempLabel(temp)}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">termômetro</p>
      </div>
      <div className="flex-1">
        <p className="mb-2 text-sm text-gray-300">Essa oferta tá boa? Vote!</p>
        <div className="flex gap-2">
          <button
            onClick={() => vote(1)}
            disabled={busy}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              myVote === 1 ? "border-orange-500 bg-orange-500/15 text-orange-400" : "border-[var(--border)] text-gray-200 hover:bg-white/5"
            }`}
          >
            🔥 Quente
          </button>
          <button
            onClick={() => vote(-1)}
            disabled={busy}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
              myVote === -1 ? "border-sky-500 bg-sky-500/15 text-sky-400" : "border-[var(--border)] text-gray-200 hover:bg-white/5"
            }`}
          >
            ❄️ Frio
          </button>
        </div>
      </div>
    </div>
  );
}
