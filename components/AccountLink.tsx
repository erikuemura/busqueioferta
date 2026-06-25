"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Link de conta no header. Resolve a sessão no cliente (fetch em /api/auth/session)
 * para não forçar renderização dinâmica das páginas públicas (preserva ISR/SSG).
 */
export function AccountLink() {
  const [state, setState] = useState<{ href: string; label: string }>({ href: "/entrar", label: "Entrar" });

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (!active) return;
        const role = s?.user?.role;
        if (s?.user) {
          const staff = role === "ADMIN" || role === "EDITOR";
          setState({ href: staff ? "/admin" : "/conta", label: staff ? "Painel" : "Minha conta" });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <Link href={state.href} className="btn-ghost px-3 py-2 text-sm">
      <span className="hidden sm:inline">👤 {state.label}</span>
      <span className="sm:hidden">👤</span>
    </Link>
  );
}
