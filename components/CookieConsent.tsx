"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "bo_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage indisponível */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="container-page flex flex-col items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
        <p className="text-sm text-gray-300">
          🍪 Usamos cookies para lembrar suas preferências e medir o uso do site. Ao continuar, você
          concorda com a nossa{" "}
          <Link href="/privacidade" className="text-brand hover:underline">Política de Privacidade</Link>.
        </p>
        <button onClick={accept} className="btn-brand ml-auto shrink-0 px-5 py-2 text-sm">
          Aceitar
        </button>
      </div>
    </div>
  );
}
