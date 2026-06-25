/**
 * Termos populares para SEO programático (/ofertas/[termo]).
 * Cada termo gera uma página indexável com título/descrição/H1 únicos.
 * A lista alimenta o sitemap e pode crescer para milhares de termos
 * (ex.: derivados de buscas reais / tendências).
 */
export interface SeoTerm {
  slug: string;
  label: string; // como aparece no H1/título
  /** termos de busca usados para filtrar ofertas (OR no título). */
  keywords: string[];
}

export const SEO_TERMS: SeoTerm[] = [
  { slug: "notebook", label: "Notebook", keywords: ["notebook", "laptop"] },
  { slug: "iphone", label: "iPhone", keywords: ["iphone"] },
  { slug: "celular", label: "Celular", keywords: ["celular", "smartphone", "galaxy", "moto", "redmi"] },
  { slug: "smart-tv", label: "Smart TV", keywords: ["smart tv", "tv 4k", "televisor"] },
  { slug: "tv-samsung", label: "TV Samsung", keywords: ["tv samsung", "samsung tv"] },
  { slug: "playstation-5", label: "PlayStation 5", keywords: ["playstation", "ps5"] },
  { slug: "fone-de-ouvido", label: "Fone de Ouvido", keywords: ["fone", "headset", "earbuds"] },
  { slug: "air-fryer", label: "Air Fryer", keywords: ["air fryer", "fritadeira"] },
  { slug: "geladeira", label: "Geladeira", keywords: ["geladeira", "refrigerador"] },
  { slug: "perfume", label: "Perfume", keywords: ["perfume", "colônia"] },
  { slug: "tenis", label: "Tênis", keywords: ["tênis", "tenis"] },
  { slug: "smartwatch", label: "Smartwatch", keywords: ["smartwatch", "relógio inteligente", "watch"] },
  { slug: "cadeira-gamer", label: "Cadeira Gamer", keywords: ["cadeira gamer"] },
  { slug: "whey-protein", label: "Whey Protein", keywords: ["whey", "proteína"] },
  { slug: "monitor", label: "Monitor", keywords: ["monitor"] },
  { slug: "cafeteira", label: "Cafeteira", keywords: ["cafeteira", "nespresso"] },
];

const bySlug = new Map(SEO_TERMS.map((t) => [t.slug, t]));
export const getTerm = (slug: string) => bySlug.get(slug);
