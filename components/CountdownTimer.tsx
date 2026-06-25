"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    expired: ms <= 0,
    h: Math.floor(ms / 3_600_000),
    m: Math.floor((ms % 3_600_000) / 60_000),
    s: Math.floor((ms % 60_000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CountdownTimer({ expiresAt }: { expiresAt: string | Date }) {
  const target = new Date(expiresAt).getTime();
  // Evita mismatch de hidratação: só renderiza o tempo após montar no cliente.
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!t) {
    return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">⏱ --:--:--</span>;
  }
  if (t.expired) {
    return <span className="text-xs font-semibold text-gray-400">Oferta expirada</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/10 px-1.5 py-0.5 text-xs font-bold tabular-nums text-amber-400">
      ⏱ {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}
