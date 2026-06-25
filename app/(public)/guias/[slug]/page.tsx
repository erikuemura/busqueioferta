import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Offer, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getGuide, GUIDES } from "@/lib/guides";
import { absoluteUrl, buildMetadata, breadcrumbLd, faqLd, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferCard } from "@/components/OfferCard";

export const revalidate = 1800;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guias/${guide.slug}`,
    type: "article",
  });
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const where: Prisma.OfferWhereInput = {
    status: "ACTIVE",
    OR: guide.offerKeywords.map((k) => ({ title: { contains: k, mode: "insensitive" as const } })),
  };
  let offers: Offer[] = [];
  try {
    offers = await prisma.offer.findMany({ where, orderBy: { discountPercent: "desc" }, take: 8 });
  } catch {
    /* sem banco → vazio */
  }

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: absoluteUrl(`/guias/${guide.slug}`),
  };

  return (
    <>
      <Header />
      <main className="container-page py-6">
        <nav className="mb-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link> /{" "}
          <Link href="/guias" className="hover:text-white">Guias</Link> /{" "}
          <span className="text-gray-300">{guide.title}</span>
        </nav>

        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-tight">{guide.title}</h1>
          <p className="mt-2 text-xs text-gray-500">Atualizado em {guide.updated} · por {SITE_NAME}</p>
          <p className="mt-4 text-lg text-gray-300">{guide.intro}</p>

          {guide.sections.map((s) => (
            <section key={s.h2} className="mt-8">
              <h2 className="text-xl font-bold">{s.h2}</h2>
              <p className="mt-2 leading-relaxed text-gray-300">{s.body}</p>
            </section>
          ))}

          {offers.length > 0 && (
            <section className="mt-12">
              <h2 className="section-title mb-4">Ofertas recomendadas</h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {offers.map((o) => (
                  <OfferCard key={o.id} offer={o} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-12">
            <h2 className="section-title mb-4">Perguntas frequentes</h2>
            <div className="space-y-3">
              {guide.faq.map((f) => (
                <details key={f.q} className="card p-4">
                  <summary className="cursor-pointer font-semibold">{f.q}</summary>
                  <p className="mt-2 text-sm text-gray-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/guias" className="btn-ghost">← Todos os guias</Link>
            <Link href="/" className="btn-brand">Ver todas as ofertas</Link>
          </div>
        </article>
      </main>
      <Footer />

      <JsonLd
        data={[
          articleLd,
          breadcrumbLd([
            { name: "Início", path: "/" },
            { name: "Guias", path: "/guias" },
            { name: guide.title, path: `/guias/${guide.slug}` },
          ]),
          faqLd(guide.faq),
        ]}
      />
    </>
  );
}
