"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-20 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)]/95 text-lg text-gray-200 shadow-xl backdrop-blur transition hover:border-brand/60 hover:text-white sm:bottom-6"
    >
      ↑
    </button>
  );
}
