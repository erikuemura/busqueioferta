import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbLd, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Política de Privacidade",
  description: `Como o ${SITE_NAME} coleta, usa e protege seus dados, e como usamos links de afiliados e cookies.`,
  path: "/privacidade",
});

const CONTACT = "contato@busqueioferta.com.br";

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link> / <span className="text-gray-300">Privacidade</span>
        </nav>

        <article className="prose-legal mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold">Política de Privacidade</h1>
          <p className="mt-2 text-xs text-gray-500">Última atualização: junho de 2026</p>

          <Section title="1. Quem somos">
            O {SITE_NAME} é um agregador de ofertas que reúne promoções e cupons dos principais
            marketplaces do Brasil. Esta política explica quais dados tratamos e por quê, em
            conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
          </Section>

          <Section title="2. Dados que coletamos">
            <ul className="ml-5 list-disc space-y-1">
              <li><strong>Cadastro (opcional):</strong> nome, e-mail e senha quando você cria uma conta.</li>
              <li><strong>Preferências:</strong> categorias de interesse, telefone (WhatsApp) e canais escolhidos, quando você os informa.</li>
              <li><strong>Uso:</strong> dados de navegação e cliques em ofertas (de forma agregada) para melhorar a curadoria.</li>
            </ul>
          </Section>

          <Section title="3. Como usamos seus dados">
            <ul className="ml-5 list-disc space-y-1">
              <li>Enviar as ofertas e cupons das categorias que você escolheu (e-mail e/ou WhatsApp).</li>
              <li>Melhorar a relevância das ofertas e a experiência do site.</li>
              <li>Cumprir obrigações legais.</li>
            </ul>
            <p className="mt-2">Não vendemos seus dados pessoais a terceiros.</p>
          </Section>

          <Section title="4. Links de afiliados">
            O {SITE_NAME} participa de programas de afiliados (como Amazon Associates, Mercado Livre,
            Awin e outros). Isso significa que alguns links do site são monetizados: quando você compra
            por eles, podemos receber uma comissão da loja, <strong>sem nenhum custo extra para você</strong>.
            Esses programas podem usar cookies próprios para atribuir a venda.
          </Section>

          <Section title="5. Cookies">
            Usamos cookies e tecnologias semelhantes para lembrar suas preferências, manter sua sessão e
            medir o uso do site (analytics). Você pode gerenciar cookies nas configurações do seu
            navegador. Cookies de afiliados são definidos pelas lojas ao clicar nos links.
          </Section>

          <Section title="6. Seus direitos (LGPD)">
            Você pode, a qualquer momento, solicitar acesso, correção, portabilidade ou exclusão dos seus
            dados, além de revogar consentimentos. Para isso, e para cancelar o recebimento de ofertas,
            entre em contato pelo e-mail <a href={`mailto:${CONTACT}`} className="text-brand hover:underline">{CONTACT}</a>.
          </Section>

          <Section title="7. Retenção e segurança">
            Mantemos seus dados apenas pelo tempo necessário às finalidades descritas. Adotamos medidas
            técnicas e organizacionais para proteger suas informações.
          </Section>

          <Section title="8. Alterações">
            Podemos atualizar esta política periodicamente. A data no topo indica a última revisão.
          </Section>

          <p className="mt-8 text-sm text-gray-400">
            Dúvidas? Fale com a gente em{" "}
            <a href={`mailto:${CONTACT}`} className="text-brand hover:underline">{CONTACT}</a>. Veja também os{" "}
            <Link href="/termos" className="text-brand hover:underline">Termos de Uso</Link>.
          </p>
        </article>
      </main>
      <Footer />
      <JsonLd data={breadcrumbLd([{ name: "Início", path: "/" }, { name: "Privacidade", path: "/privacidade" }])} />
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
