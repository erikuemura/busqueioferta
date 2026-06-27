"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ctx {
  loggedIn: boolean;
  has: (offerId: string) => boolean;
  toggle: (offerId: string) => void;
}

const FavoritesContext = createContext<Ctx>({ loggedIn: false, has: () => false, toggle: () => {} });

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/watchlist")
      .then((r) => r.json())
      .then((d) => {
        setLoggedIn(Boolean(d.loggedIn));
        if (Array.isArray(d.ids)) setIds(new Set(d.ids));
      })
      .catch(() => {});
  }, []);

  const has = useCallback((offerId: string) => ids.has(offerId), [ids]);

  const toggle = useCallback(
    (offerId: string) => {
      if (!loggedIn) {
        router.push(`/entrar?next=/oferta/${offerId}`);
        return;
      }
      const isFav = ids.has(offerId);
      // otimista
      setIds((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(offerId) : next.add(offerId);
        return next;
      });
      fetch("/api/watchlist", {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      }).catch(() => {
        // reverte em falha
        setIds((prev) => {
          const next = new Set(prev);
          isFav ? next.add(offerId) : next.delete(offerId);
          return next;
        });
      });
    },
    [ids, loggedIn, router],
  );

  return <FavoritesContext.Provider value={{ loggedIn, has, toggle }}>{children}</FavoritesContext.Provider>;
}
