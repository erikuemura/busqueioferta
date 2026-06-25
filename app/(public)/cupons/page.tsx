import Link from "next/link";
import type { Coupon } from "@prisma/client";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PUBLIC_MARKETPLACES } from "@/lib/categories";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CouponCard } from "@/components/CouponCard";

export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: "Cupons de desconto válidos hoje — Amazon, Mercado Livre e mais",
  description:
    "Cupons de desconto verificados das principais lojas do Brasil. Códigos promocionais de Amazon, Mercado Livre, Magazine Luiza, Kabum e mais. Atualizados todo dia.",
  path: "/cupons",
});

export default async function CouponsPage() {
  let coupons: Coupon[] = [];
  try {
    coupons = await prisma.coupon.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 60,
    });
  } catch {
    /* sem banco → vazio */
  }

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">
            Início
          </Link>{" "}
          / <span className="text-gray-300">Cupons</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Cupons de desconto válidos hoje</h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Códigos promocionais verificados das principais lojas do Brasil. Copie o cupom e economize
            na sua próxima compra.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          {PUBLIC_MARKETPLACES.map((m) => (
            <Link
              key={m.slug}
              href={`/cupons/${m.slug}`}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/5"
            >
              Cupons {m.label}
            </Link>
          ))}
        </div>

        {coupons.length === 0 ? (
          <div className="card py-16 text-center text-gray-400">
            Nenhum cupom ativo no momento. Volte em breve — atualizamos os cupons diariamente.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        )}
      </main>
      <Footer />

      <JsonLd data={breadcrumbLd([{ name: "Início", path: "/" }, { name: "Cupons", path: "/cupons" }])} />
    </>
  );
}
