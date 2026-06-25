import Link from "next/link";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { AccountLink } from "./AccountLink";
import { LogoMark } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          <LogoMark className="h-9 w-9 drop-shadow-sm" />
          <span className="hidden sm:inline">
            busque<span className="text-brand">ioferta</span>
          </span>
        </Link>

        <SearchAutocomplete />

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link href="/cupons" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white md:block">
            🎟️ Cupons
          </Link>
          <AccountLink />
        </nav>
      </div>
    </header>
  );
}
