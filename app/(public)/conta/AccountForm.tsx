"use client";

import { useState, useTransition } from "react";
import { CATEGORIES } from "@/lib/categories";
import { updateProfileAction } from "./actions";

interface Props {
  initial: {
    name: string;
    phone: string;
    interests: string[];
    wantsWhatsapp: boolean;
    wantsEmail: boolean;
  };
}

export function AccountForm({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [wantsWhatsapp, setWantsWhatsapp] = useState(initial.wantsWhatsapp);
  const [wantsEmail, setWantsEmail] = useState(initial.wantsEmail);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function toggle(value: string) {
    setSaved(false);
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function save() {
    start(async () => {
      await updateProfileAction({ name, phone, interests, wantsWhatsapp, wantsEmail });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  const input =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <div className="space-y-6">
      {/* Passo 1 — interesses */}
      <section className="card p-5">
        <h2 className="font-bold">1. Quais ofertas você quer receber?</h2>
        <p className="mb-3 mt-1 text-sm text-gray-400">Escolha suas categorias favoritas. Só enviamos o que te interessa.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => toggle(c.value)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition ${
                interests.includes(c.value)
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-[var(--border)] text-gray-300 hover:bg-white/5"
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* Passo 2 — WhatsApp */}
      <section className="card p-5">
        <h2 className="font-bold">2. Receber no WhatsApp 💬</h2>
        <p className="mb-3 mt-1 text-sm text-gray-400">Informe seu número para entrarmos em contato com as ofertas do seu nicho.</p>
        <input
          className={input}
          type="tel"
          placeholder="(11) 99999-9999"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setSaved(false);
          }}
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={wantsWhatsapp} onChange={(e) => setWantsWhatsapp(e.target.checked)} />
          Quero receber ofertas pelo WhatsApp
        </label>
      </section>

      {/* Passo 3 — Email */}
      <section className="card p-5">
        <h2 className="font-bold">3. Receber por e-mail 📧</h2>
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={wantsEmail} onChange={(e) => setWantsEmail(e.target.checked)} />
          Quero o resumo das melhores ofertas por e-mail
        </label>
      </section>

      {/* Nome opcional */}
      <section className="card p-5">
        <h2 className="font-bold">Seu nome</h2>
        <input className={`${input} mt-2`} placeholder="Como podemos te chamar?" value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={pending} className="btn-brand px-6 py-3 disabled:opacity-60">
          {pending ? "Salvando…" : "Salvar preferências"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-400">✓ Preferências salvas!</span>}
      </div>
    </div>
  );
}
