import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbLd, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Termos de Uso",
  description: `Termos e condições de uso do ${SITE_NAME}.`,
  path: "/termos",
});

const CONTACT = "contato@busqueioferta.com.br";

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link> / <span className="text-gray-300">Termos</span>
        </nav>

        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold">Termos de Uso</h1>
          <p className="mt-2 text-xs text-gray-500">Última atualização: junho de 2026</p>

          <Section title="1. Sobre o serviço">
            O {SITE_NAME} é um agregador que reúne e divulga ofertas, promoções e cupons de lojas
            parceiras. Não vendemos produtos: ao clicar em uma oferta, você é direcionado à loja oficial,
            onde a compra é realizada e regida pelos termos da própria loja.
          </Section>

          <Section title="2. Preços e disponibilidade">
            Preços, descontos, estoque e condições são definidos pelas lojas e mudam com frequência.
            Embora atualizemos as ofertas constantemente, não garantimos que um preço ou cupom estará
            disponível no momento da sua compra. Confira sempre as informações na loja antes de finalizar.
          </Section>

          <Section title="3. Links de afiliados">
            Alguns links são de afiliados e podem gerar comissão para o {SITE_NAME}, sem custo extra para
            você. Veja detalhes na <Link href="/privacidade" className="text-brand hover:underline">Política de Privacidade</Link>.
          </Section>

          <Section title="4. Conta do usuário">
            Ao criar uma conta, você é responsável por manter a confidencialidade da sua senha e pelas
            atividades realizadas. Você pode cancelar sua conta e o recebimento de ofertas a qualquer momento.
          </Section>

          <Section title="5. Uso aceitável">
            Você concorda em não usar o site para fins ilícitos, nem tentar coletar dados de forma
            automatizada sem autorização, sobrecarregar a infraestrutura ou violar direitos de terceiros.
          </Section>

          <Section title="6. Limitação de responsabilidade">
            O {SITE_NAME} não se responsabiliza por problemas relativos a produtos, entregas, pagamentos
            ou atendimento das lojas parceiras, por serem relações entre você e a loja.
          </Section>

          <Section title="7. Contato">
            Dúvidas sobre estes termos? Fale com a gente em{" "}
            <a href={`mailto:${CONTACT}`} className="text-brand hover:underline">{CONTACT}</a>.
          </Section>
        </article>
      </main>
      <Footer />
      <JsonLd data={breadcrumbLd([{ name: "Início", path: "/" }, { name: "Termos", path: "/termos" }])} />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2 leading-relaxed text-gray-300">{children}</div>
    </section>
  );
}
