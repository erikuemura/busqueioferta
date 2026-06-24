"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-gray-100 focus:border-brand focus:outline-none"
      />
      <input
        type="password"
        required
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-gray-100 focus:border-brand focus:outline-none"
      />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button type="submit" disabled={loading} className="btn-brand py-3 disabled:opacity-60">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
