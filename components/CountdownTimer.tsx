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

export function CountdownTimer({ expiresAt }: { expiresAt: string | Date }) {
  const target = new Date(expiresAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (t.expired) {
    return <span className="text-xs font-semibold text-gray-400">Oferta expirada</span>;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
      ⏱ {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
    </span>
  );
}
