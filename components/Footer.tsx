import Link from "next/link";
import { CATEGORIES, PUBLIC_MARKETPLACES } from "@/lib/categories";
import { SEO_TERMS } from "@/lib/terms";
import { GUIDES } from "@/lib/guides";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] py-10">
      <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-3 text-sm font-bold text-gray-200">Categorias</p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-white">
                  Ofertas de {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-gray-200">Mais buscados</p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {SEO_TERMS.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link href={`/ofertas/${t.slug}`} className="hover:text-white">
                  {t.label} em oferta
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-gray-200">Cupons por loja</p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {PUBLIC_MARKETPLACES.slice(0, 5).map((m) => (
              <li key={m.slug}>
                <Link href={`/cupons/${m.slug}`} className="hover:text-white">
                  Cupons {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-bold text-gray-200">Guias & institucional</p>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {GUIDES.slice(0, 3).map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="line-clamp-1 hover:text-white">
                  {g.title}
                </Link>
              </li>
            ))}
            <li><Link href="/guias" className="hover:text-white">Todos os guias</Link></li>
            <li><Link href="/sobre" className="hover:text-white">Sobre nós</Link></li>
          </ul>
        </div>
      </div>

      <div className="container-page mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} busqueioferta — curadoria inteligente de ofertas.</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/cupons" className="hover:text-white">Cupons</Link>
          <Link href="/guias" className="hover:text-white">Guias</Link>
          <Link href="/sobre" className="hover:text-white">Sobre</Link>
          <Link href="/alertas" className="hover:text-white">Alertas</Link>
          <Link href="/admin" className="hover:text-white">Painel</Link>
        </nav>
      </div>
      <p className="container-page mt-4 text-xs text-gray-600">
        Alguns links são de afiliados — ao comprar por eles você ajuda a manter o site, sem custo
        extra para você.
      </p>
    </footer>
  );
}
