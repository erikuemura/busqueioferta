"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function CustomerAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isRegister) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(isRegister ? "Conta criada, mas falhou ao entrar. Tente fazer login." : "E-mail ou senha inválidos.");
      return;
    }
    router.push("/conta");
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {isRegister && (
        <input className={input} placeholder="Seu nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
      )}
      <input className={input} type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={input} type="password" required placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button type="submit" disabled={loading} className="btn-brand py-3 disabled:opacity-60">
        {loading ? "Aguarde…" : isRegister ? "Criar conta grátis" : "Entrar"}
      </button>

      <p className="text-center text-sm text-gray-400">
        {isRegister ? (
          <>Já tem conta? <Link href="/entrar" className="font-medium text-brand hover:underline">Entrar</Link></>
        ) : (
          <>Novo por aqui? <Link href="/cadastro" className="font-medium text-brand hover:underline">Criar conta grátis</Link></>
        )}
      </p>
    </form>
  );
}
