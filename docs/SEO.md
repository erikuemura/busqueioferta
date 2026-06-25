# SEO — busqueioferta

Estratégia: capturar tráfego orgânico de cauda longa (intenção de compra) via
**SEO programático** + base técnica sólida.

## SEO técnico (implementado)

| Item | Onde |
|---|---|
| `sitemap.xml` dinâmico | `app/sitemap.ts` — home, categorias, termos, cupons, ofertas |
| `robots.txt` | `app/robots.ts` — bloqueia `/admin` e `/api`, aponta sitemap |
| Canonical URLs | `lib/seo.ts` `buildMetadata()` em todas as páginas públicas |
| Meta tags dinâmicas | título/descrição únicos por página |
| Open Graph + Twitter Cards | `buildMetadata()` + OG por oferta (imagem do produto) |
| Organization + WebSite (SearchAction) | `app/layout.tsx` |
| Breadcrumb | categoria, oferta, cupons |
| Product + Offer + AggregateRating | `/oferta/[id]` |
| ItemList | categoria, `/ofertas/[termo]` |
| FAQPage | `/ofertas/[termo]`, `/cupons/[marketplace]` |
| ISR (15 min) | páginas públicas (`revalidate = 900`) |
| `next/image` (AVIF/WebP) | cards e detalhes |

## SEO programático

Geramos páginas indexáveis em escala:

- **`/ofertas/[termo]`** — `lib/terms.ts` define os termos (notebook, iphone,
  smart-tv, air-fryer…). Cada um vira página com H1, intro, FAQ e grade de ofertas
  filtradas. `generateStaticParams` pré-renderiza os conhecidos; `dynamicParams`
  permite novos termos on-demand.
- **`/cupons/[marketplace]`** — cupons por loja (Amazon, Mercado Livre, Magalu…).
- **`/categoria/[slug]`** — 12 categorias com ordenação.

Para escalar para milhares de páginas: basta popular `SEO_TERMS` (ou gerar a partir
de buscas reais / Google Search Console / tendências) — sitemap e rotas acompanham
automaticamente.

## Linkagem interna
O `Footer` lista categorias, termos mais buscados e cupons por loja em toda página,
distribuindo autoridade e facilitando a indexação.

## Core Web Vitals
- `next/image` com lazy loading e formatos modernos (AVIF/WebP).
- ISR + cache de imagens (`minimumCacheTTL`).
- Componentes server-first; JS de cliente mínimo (apenas interações: copiar cupom,
  countdown, formulários).
- Headers de cache para `/generated`.

## Próximos passos de SEO
- Blog / guias de compra (`/guias/[slug]`) para topo de funil.
- Páginas de comparação (`/comparar/[a]-vs-[b]`).
- Histórico de preços por produto (conteúdo único + rich snippet).
- Geração de `SEO_TERMS` a partir do Search Console (API) e tendências.
- `hreflang` se houver expansão regional.
- Imagem OG dinâmica por oferta via `/api/social/[id]/image` no `og:image`.
