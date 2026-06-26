import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://busqueioferta.vercel.app";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "busqueioferta";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/** Monta Metadata com canonical + Open Graph + Twitter de forma consistente. */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(opts.path);
  // Default: imagem OG de marca gerada dinamicamente com o título da página.
  const ogImage = opts.image ?? absoluteUrl(`/api/og?title=${encodeURIComponent(opts.title)}`);
  const images = [{ url: ogImage }];
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: opts.type ?? "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  };
}

// ---------- JSON-LD builders ----------

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    sameAs: [
      "https://instagram.com/busqueioferta",
      "https://t.me/busqueioferta",
      "https://tiktok.com/@busqueioferta",
    ],
  };
}

export function webSiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function itemListLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
