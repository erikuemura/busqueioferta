import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Prisma, Offer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTerm, SEO_TERMS } from "@/lib/terms";
import { buildMetadata, breadcrumbLd, itemListLd, faqLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferGrid } from "@/components/OfferGrid";
import { formatPrice } from "@/lib/utils";

export const revalidate = 900;
export const dynamicParams = true;

export function generateStaticParams() {
  return SEO_TERMS.map((t) => ({ termo: t.slug }));
}

function whereFor(keywords: string[]): Prisma.OfferWhereInput {
  return {
    status: "ACTIVE",
    OR: keywords.map((k) => ({ title: { contains: k, mode: "insensitive" as const } })),
  };
}

export async function generateMetadata({ params }: { params: { termo: string } }): Promise<Metadata> {
  const term = getTerm(params.termo);
  if (!term) return {};
  return buildMetadata({
    title: `Ofertas de ${term.label} com desconto — ${new Date().getFullYear()}`,
    description: `As melhores ofertas e promoções de ${term.label} dos principais marketplaces do Brasil. Compare preços, veja o desconto e economize com link verificado.`,
    path: `/ofertas/${term.slug}`,
  });
}

export default async function TermPage({ params }: { params: { termo: string } }) {
  const term = getTerm(params.termo);
  if (!term) notFound();

  const where = whereFor(term.keywords);
  let offers: Offer[] = [];
  let cheapest: Offer | null = null;
  try {
    [offers, cheapest] = await Promise.all([
      prisma.offer.findMany({ where, orderBy: [{ discountPercent: "desc" }], take: 24 }),
      prisma.offer.findFirst({ where, orderBy: { currentPrice: "asc" } }),
    ]);
  } catch {
    /* banco indisponível → página renderiza vazia */
  }

  const faq = [
    {
      q: `Vale a pena comprar ${term.label} em promoção agora?`,
      a: `Reunimos as melhores ofertas de ${term.label} dos principais marketplaces. ${cheapest ? `O menor preço encontrado é ${formatPrice(cheapest.currentPrice)}.` : ""} Atualizamos a lista continuamente.`,
    },
    {
      q: `Onde encontrar ${term.label} mais barato?`,
      a: `Comparamos preços de Amazon, Mercado Livre, Magazine Luiza e outras lojas para mostrar o melhor desconto de ${term.label} em um só lugar.`,
    },
    {
      q: "Os links são seguros?",
      a: "Sim. Todos os links levam direto à loja oficial, com a oferta aplicada.",
    },
  ];

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">
            Início
          </Link>{" "}
          / <span className="text-gray-300">Ofertas de {term.label}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Ofertas de {term.label} com desconto
          </h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Encontramos {offers.length > 0 ? offers.length : "as melhores"} ofertas de{" "}
            <strong>{term.label}</strong> nos principais marketplaces do Brasil.
            {cheapest && (
              <>
                {" "}A partir de <strong className="text-brand">{formatPrice(cheapest.currentPrice)}</strong>.
              </>
            )}{" "}
            Comparamos preços e mostramos o maior desconto, com link verificado direto da loja.
          </p>
        </header>

        <OfferGrid offers={offers} />

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
            { name: `Ofertas de ${term.label}`, path: `/ofertas/${term.slug}` },
          ]),
          itemListLd(offers.map((o) => ({ name: o.title, path: `/oferta/${o.id}` }))),
          faqLd(faq),
        ]}
      />
    </>
  );
}
