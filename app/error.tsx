"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Em produção, plugar aqui um serviço de error tracking (ex.: Sentry).
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="mb-4 text-6xl">😕</div>
        <h1 className="text-2xl font-extrabold">Algo deu errado por aqui</h1>
        <p className="mt-3 text-gray-400">
          Tivemos um problema ao carregar esta página. Tente novamente — se persistir, volte mais tarde.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-brand">Tentar novamente</button>
          <Link href="/" className="btn-ghost">Voltar ao início</Link>
        </div>
      </div>
    </main>
  );
}
