"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    // assina a todas as categorias (digest geral); para preferências finas, use a conta.
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, categories: CATEGORIES.map((c) => c.value) }),
    });
    setState(res.ok ? "done" : "error");
  }

  return (
    <section className="relative mt-14 overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#1b1410] to-[var(--card)] p-8 sm:p-10">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">📩 Receba as melhores ofertas no e-mail</h2>
        <p className="mt-2 text-gray-300">
          Um resumo com as promoções mais quentes do dia. Sem spam, cancele quando quiser.
        </p>

        {state === "done" ? (
          <p className="mt-6 font-semibold text-emerald-400">✓ Pronto! Você está inscrito. 🎉</p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button type="submit" disabled={state === "loading"} className="btn-brand px-6 py-3 disabled:opacity-60">
              {state === "loading" ? "Enviando…" : "Quero receber"}
            </button>
          </form>
        )}
        {state === "error" && <p className="mt-3 text-sm text-accent">Algo deu errado. Tente novamente.</p>}
        <p className="mt-3 text-xs text-gray-500">
          Quer escolher só os nichos que te interessam?{" "}
          <a href="/cadastro" className="text-brand hover:underline">Crie sua conta grátis</a>.
        </p>
      </div>
    </section>
  );
}
