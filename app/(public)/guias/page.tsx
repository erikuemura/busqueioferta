import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES } from "@/lib/guides";
import { buildMetadata, breadcrumbLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Guias de compra — como escolher e economizar",
  description:
    "Guias práticos para escolher notebook, smart TV, air fryer, iPhone e mais — com dicas e ofertas reais para economizar.",
  path: "/guias",
});

export default function GuidesIndex() {
  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link> / <span className="text-gray-300">Guias</span>
        </nav>
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Guias de compra</h1>
          <p className="mt-2 max-w-2xl text-gray-400">
            Antes de comprar, entenda o que importa. Guias diretos ao ponto para você escolher melhor e
            economizar — com ofertas reais.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="card p-5 transition hover:border-brand/50">
              <h2 className="text-lg font-bold">{g.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{g.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-brand">Ler guia →</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <JsonLd data={breadcrumbLd([{ name: "Início", path: "/" }, { name: "Guias", path: "/guias" }])} />
    </>
  );
}
