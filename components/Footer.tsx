import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] py-8">
      <div className="container-page flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} busqueioferta — curadoria inteligente de ofertas.</p>
        <nav className="flex gap-4">
          <Link href="/alertas" className="hover:text-white">
            Alertas por e-mail
          </Link>
          <Link href="/admin" className="hover:text-white">
            Painel
          </Link>
        </nav>
      </div>
      <p className="container-page mt-4 text-xs text-gray-600">
        Alguns links são de afiliados — ao comprar por eles você ajuda a manter o site, sem custo
        extra para você.
      </p>
    </footer>
  );
}
