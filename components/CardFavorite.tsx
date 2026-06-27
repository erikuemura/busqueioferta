"use client";

import { useFavorites } from "./FavoritesProvider";

export function CardFavorite({ offerId }: { offerId: string }) {
  const { has, toggle } = useFavorites();
  const fav = has(offerId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(offerId);
      }}
      aria-label={fav ? "Remover dos favoritos" : "Favoritar"}
      aria-pressed={fav}
      className={`grid h-8 w-8 place-items-center rounded-full text-lg shadow backdrop-blur transition ${
        fav ? "bg-accent text-white" : "bg-black/45 text-white hover:bg-black/65"
      }`}
    >
      {fav ? "♥" : "♡"}
    </button>
  );
}
