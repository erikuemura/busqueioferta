import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "busqueioferta";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">🔥</span>
          <span>
            busque<span className="text-brand">ioferta</span>
          </span>
        </Link>

        <form action="/" className="relative ml-auto hidden flex-1 max-w-md sm:block">
          <input
            type="search"
            name="q"
            placeholder="Buscar ofertas..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none"
          />
        </form>

        <Link href="/cupons" className="hidden text-sm font-medium text-gray-300 hover:text-white sm:block">
          🎟️ Cupons
        </Link>
        <Link href="/alertas" className="btn-ghost text-sm">
          🔔 Alertas
        </Link>
      </div>
      <span className="sr-only">{siteName}</span>
    </header>
  );
}
