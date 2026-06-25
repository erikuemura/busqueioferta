import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function CategoryNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link href="/" className={cn("chip", !activeSlug && "chip-active")}>
        🔥 Todas
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/categoria/${c.slug}`}
          className={cn("chip", activeSlug === c.slug && "chip-active")}
        >
          <span>{c.icon}</span>
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
