"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./Logo";

const KEY = "bo_pwa_prompt"; // dispensado/instalado

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1) registra o service worker (só em produção, evita conflito com HMR)
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2) já instalado? (rodando como app / standalone)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    // 3) já dispensou/instalou antes? (e só após aceitar os cookies, p/ não
    // sobrepor o banner de consentimento no rodapé)
    try {
      if (localStorage.getItem(KEY)) return;
      if (!localStorage.getItem("bo_cookie_consent")) return;
    } catch {
      return;
    }

    // 4) só em dispositivos móveis (não exibir no desktop/web)
    const ua = navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    if (!isMobile) return;

    const isIos = /iPhone|iPad|iPod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;

    // Android/Chrome: captura o evento nativo de instalação
    const onBIP = (e: Event) => {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari não dispara beforeinstallprompt → mostra instruções
    if (isIos) {
      setIos(true);
      setShow(true);
    }

    const onInstalled = () => persistAndHide();
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function persistAndHide() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  async function install() {
    const d = deferred.current;
    if (d) {
      await d.prompt();
      await d.userChoice;
      deferred.current = null;
    }
    persistAndHide();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:hidden">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-3 shadow-2xl backdrop-blur">
        <LogoMark className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Instale o app busqueioferta</p>
          {ios ? (
            <p className="text-xs text-gray-400">
              Toque em <span className="font-semibold">Compartilhar</span> e depois em{" "}
              <span className="font-semibold">Adicionar à Tela de Início</span>.
            </p>
          ) : (
            <p className="text-xs text-gray-400">Ofertas na palma da mão, sem ocupar espaço.</p>
          )}
        </div>
        {!ios && (
          <button onClick={install} className="btn-brand shrink-0 px-4 py-2 text-sm">
            Instalar
          </button>
        )}
        <button
          onClick={persistAndHide}
          aria-label="Fechar"
          className="shrink-0 px-2 text-gray-500 hover:text-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
