import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-md shadow-brand/30">
            🔥
          </span>
          <span className="hidden sm:inline">
            busque<span className="text-brand">ioferta</span>
          </span>
        </Link>

        <form action="/" className="relative ml-auto flex-1 sm:ml-2 sm:max-w-xl">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            name="q"
            placeholder="Buscar produtos, marcas e ofertas..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-500 transition focus:border-brand focus:bg-[var(--bg-soft)] focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </form>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link href="/cupons" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white md:block">
            🎟️ Cupons
          </Link>
          <Link href="/alertas" className="btn-ghost px-3 py-2 text-sm">
            <span className="hidden sm:inline">🔔 Alertas</span>
            <span className="sm:hidden">🔔</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
