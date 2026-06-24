import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link
        href="/"
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition",
          !activeSlug
            ? "border-brand bg-brand/10 text-brand"
            : "border-[var(--border)] text-gray-300 hover:bg-white/5",
        )}
      >
        🔥 Todas
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/categoria/${c.slug}`}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition",
            activeSlug === c.slug
              ? "border-brand bg-brand/10 text-brand"
              : "border-[var(--border)] text-gray-300 hover:bg-white/5",
          )}
        >
          <span>{c.icon}</span>
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
