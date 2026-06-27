import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function CategoryShowcase() {
  return (
    <section className="mb-10">
      <h2 className="section-title mb-4">Explore por categoria</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[var(--border)] p-3 text-center transition hover:-translate-y-0.5 hover:border-brand/50"
            style={{ background: `linear-gradient(150deg, ${c.gradient[1]}55, ${c.gradient[0]}22)` }}
          >
            <span className="text-3xl transition group-hover:scale-110">{c.icon}</span>
            <span className="text-xs font-semibold leading-tight text-gray-100">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
