import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16 text-center">
      <div className="max-w-md">
        <div className="mb-4 text-6xl">🔍</div>
        <h1 className="text-3xl font-extrabold">Ops! Não achamos essa oferta</h1>
        <p className="mt-3 text-gray-400">
          A página que você procura pode ter expirado ou saído do ar. Mas temos milhares de ofertas
          esperando por você.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-brand">🏠 Voltar ao início</Link>
          <Link href="/cupons" className="btn-ghost">🎟️ Ver cupons</Link>
        </div>
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Categorias populares</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/categoria/${c.slug}`} className="chip">
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
