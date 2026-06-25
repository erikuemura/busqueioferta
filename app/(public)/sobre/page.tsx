import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbLd, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: `Sobre o ${SITE_NAME}`,
  description: `Conheça o ${SITE_NAME}: como reunimos e curamos as melhores ofertas do Brasil e como nos sustentamos com transparência.`,
  path: "/sobre",
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link> / <span className="text-gray-300">Sobre</span>
        </nav>

        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold">Sobre o {SITE_NAME}</h1>
          <p className="mt-4 text-lg text-gray-300">
            O {SITE_NAME} é um agregador de ofertas que reúne, em um só lugar, as melhores promoções,
            descontos e cupons dos principais marketplaces do Brasil — com curadoria inteligente que vai
            além do preço.
          </p>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Nossa missão</h2>
            <p className="mt-2 leading-relaxed text-gray-300">
              Acreditamos que economizar não deveria dar trabalho. Por isso monitoramos os marketplaces
              continuamente e destacamos apenas ofertas que realmente valem a pena — considerando desconto
              real, reputação da loja e relevância para você.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Como nos sustentamos (transparência)</h2>
            <p className="mt-2 leading-relaxed text-gray-300">
              Alguns dos links do site são de programas de afiliados. Quando você compra por eles, podemos
              receber uma pequena comissão da loja — <strong>sem nenhum custo extra para você</strong>. É
              isso que mantém o {SITE_NAME} funcionando e gratuito. A comissão nunca influencia nossa
              curadoria: mostramos a oferta porque ela é boa, não porque paga mais.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Como funciona a curadoria</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed text-gray-300">
              <li>Capturamos ofertas automaticamente nos marketplaces parceiros.</li>
              <li>Calculamos um índice de relevância (desconto real + reputação + procura).</li>
              <li>Publicamos as melhores no site e nos nossos canais.</li>
              <li>Todo link leva direto à loja oficial, com a oferta aplicada.</li>
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-lg font-bold">Encontrou um problema com uma oferta?</h2>
            <p className="mt-1 text-gray-400">
              Preços e disponibilidade mudam o tempo todo. Se algo estiver desatualizado, é só voltar mais
              tarde — atualizamos as ofertas a cada 2 horas.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/" className="btn-brand">Ver ofertas</Link>
              <Link href="/alertas" className="btn-ghost">Receber alertas</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
      <JsonLd data={breadcrumbLd([{ name: "Início", path: "/" }, { name: "Sobre", path: "/sobre" }])} />
    </>
  );
}
