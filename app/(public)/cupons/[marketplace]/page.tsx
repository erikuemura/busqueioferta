import Link from "next/link";
import { notFound } from "next/navigation";
import type { Coupon } from "@prisma/client";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getMarketplaceBySlug, PUBLIC_MARKETPLACES } from "@/lib/categories";
import { buildMetadata, breadcrumbLd, faqLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CouponCard } from "@/components/CouponCard";

export const revalidate = 900;

export function generateStaticParams() {
  return PUBLIC_MARKETPLACES.map((m) => ({ marketplace: m.slug }));
}

export async function generateMetadata({ params }: { params: { marketplace: string } }): Promise<Metadata> {
  const m = getMarketplaceBySlug(params.marketplace);
  if (!m) return {};
  return buildMetadata({
    title: `Cupons ${m.label} válidos hoje — códigos de desconto ${new Date().getFullYear()}`,
    description: `Todos os cupons de desconto ${m.label} verificados e atualizados. Códigos promocionais para economizar nas compras na ${m.label}.`,
    path: `/cupons/${m.slug}`,
  });
}

export default async function MarketplaceCouponsPage({ params }: { params: { marketplace: string } }) {
  const m = getMarketplaceBySlug(params.marketplace);
  if (!m || m.value === "MANUAL") notFound();

  let coupons: Coupon[] = [];
  try {
    coupons = await prisma.coupon.findMany({
      where: { marketplace: m.value, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 40,
    });
  } catch {
    /* sem banco → vazio */
  }

  const faq = [
    { q: `Como usar um cupom ${m.label}?`, a: `Copie o código do cupom desejado, clique em "Ir à loja" e cole o código no carrinho da ${m.label} antes de finalizar a compra.` },
    { q: `Os cupons ${m.label} são válidos?`, a: `Verificamos os cupons regularmente. Mesmo assim, alguns podem expirar ou ter regras específicas definidas pela loja.` },
  ];

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link>{" "}/{" "}
          <Link href="/cupons" className="hover:text-white">Cupons</Link>{" "}/{" "}
          <span className="text-gray-300">{m.label}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Cupons {m.label} válidos hoje</h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Os melhores cupons e códigos de desconto da <strong>{m.label}</strong>, verificados pela
            nossa equipe. Copie e economize.
          </p>
        </header>

        {coupons.length === 0 ? (
          <div className="card py-16 text-center text-gray-400">
            Nenhum cupom {m.label} ativo agora. Veja{" "}
            <Link href="/cupons" className="text-brand">todos os cupons</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <CouponCard key={c.id} coupon={c} />
            ))}
          </div>
        )}

        <section className="mt-12 max-w-2xl">
          <h2 className="mb-4 text-xl font-bold">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="card p-4">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-sm text-gray-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />

      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Início", path: "/" },
            { name: "Cupons", path: "/cupons" },
            { name: m.label, path: `/cupons/${m.slug}` },
          ]),
          faqLd(faq),
        ]}
      />
    </>
  );
}
