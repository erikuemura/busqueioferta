"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export function AlertForm() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  function toggle(value: string) {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, categories: selected }),
    });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <div className="text-center">
        <p className="text-4xl">✅</p>
        <p className="mt-2 font-semibold text-emerald-400">Pronto! Você está inscrito.</p>
        <p className="text-sm text-gray-400">Vamos te avisar quando surgirem ofertas das suas categorias.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">Seu e-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-gray-100 focus:border-brand focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-300">Categorias de interesse</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => toggle(c.value)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                selected.includes(c.value)
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-[var(--border)] text-gray-300 hover:bg-white/5"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {state === "error" && <p className="text-sm text-accent">Algo deu errado. Tente novamente.</p>}

      <button type="submit" disabled={state === "loading"} className="btn-brand py-3 disabled:opacity-60">
        {state === "loading" ? "Cadastrando..." : "Quero receber ofertas"}
      </button>
    </form>
  );
}
