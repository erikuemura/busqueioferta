"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/watchlist?offerId=${offerId}`)
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(Boolean(d.loggedIn));
        setFav(Boolean(d.favorited));
      })
      .catch(() => setLoggedIn(false));
  }, [offerId]);

  async function toggle() {
    if (loggedIn === false) {
      router.push(`/entrar?next=/oferta/${offerId}`);
      return;
    }
    setBusy(true);
    const method = fav ? "DELETE" : "POST";
    const res = await fetch("/api/watchlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId }),
    });
    setBusy(false);
    if (res.ok) setFav(!fav);
    else if (res.status === 401) router.push(`/entrar?next=/oferta/${offerId}`);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={fav}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-semibold transition disabled:opacity-60 ${
        fav
          ? "border-accent bg-accent/10 text-accent"
          : "border-[var(--border)] text-gray-200 hover:bg-white/5"
      }`}
      title="Favoritar e receber alerta de queda de preço"
    >
      {fav ? "♥ Favoritada" : "♡ Favoritar"}
    </button>
  );
}
