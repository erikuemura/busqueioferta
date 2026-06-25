# Arquitetura — busqueioferta

Agregador de ofertas com afiliados, distribuição multicanal e SEO programático.

## Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 14 (App Router)                │
│                                                               │
│  Público (ISR/SSG)            Backoffice (/admin, auth)       │
│  ─ /                          ─ dashboard (analytics)         │
│  ─ /categoria/[slug]          ─ ofertas (CRUD + bulk)         │
│  ─ /ofertas/[termo]  (SEO)    ─ social (fila + auto-publish)  │
│  ─ /cupons[/marketplace]      ─ configurações                 │
│  ─ /oferta/[id]                                               │
│                                                               │
│  API: /api/track/click  /api/offers  /api/alerts             │
│       /api/social/[id]/image  /api/health  /api/auth         │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
        ┌───────▼────────┐         ┌────────▼─────────┐
        │  PostgreSQL     │         │  Redis + BullMQ  │
        │  (Prisma)       │         │  (workers)       │
        └────────────────┘         └────────┬─────────┘
                                            │
   workers: sync · check-status · schedule-social · generate-image
            · publish-social · send-alert-emails
                                            │
        ┌───────────────────────────────────▼──────────────────┐
        │  Providers de marketplace (lib/marketplaces)           │
        │  Mercado Livre · Amazon · Awin (Magalu/Kabum/...)      │
        ├───────────────────────────────────────────────────────┤
        │  Providers sociais (lib/social)                        │
        │  Instagram · TikTok · Telegram · WhatsApp · FB · Pin   │
        └───────────────────────────────────────────────────────┘
```

## Camadas

### Apresentação (`app/`)
- **Público**: renderização ISR (`revalidate = 900`) e SSG (`generateStaticParams`)
  para SEO. Páginas resilientes: se o banco cair, degradam para estado vazio.
- **Backoffice**: server components protegidos por `requireSession()` (NextAuth JWT).
  Mutations via **Server Actions** (`app/admin/actions.ts`).

### Domínio / serviços (`lib/`)
- `marketplaces/` — `MarketplaceProvider` (contrato único) + adapters concretos.
- `social/` — um módulo por canal, com `isXConfigured()` + `publishToX()`.
- `sync.ts` — normalização, scoring, deduplicação e persistência de ofertas.
- `scoring.ts` — score de relevância (desconto·0.4 + rating·0.3 + reviews·0.3).
- `scheduler.ts` — seleção de ofertas para auto-publicação (limites/dedup).
- `affiliateLinks.ts` — injeção da tag de afiliado por marketplace.
- `seo.ts` — metadata canônica + builders de JSON-LD.
- `logger.ts`, `rateLimit.ts`, `settings.ts`, `categories.ts`, `terms.ts`.

### Dados (`prisma/`)
Modelos: `Offer`, `Coupon`, `SocialPost`, `Tag`, `AlertSubscription`,
`ClickEvent`, `Campaign`, `User`, `Settings`. Migrations versionadas em
`prisma/migrations`.

### Workers (`workers/`)
Processos BullMQ separados do web (não rodam no Vercel — ver DEPLOYMENT.md).
Conexão Redis lazy: sem `REDIS_URL` o site funciona, só a automação fica inativa.

## Princípios
- **Degradação graciosa**: falha de banco/Redis nunca derruba o site público.
- **Provider pattern**: novos marketplaces/canais entram sem tocar no core.
- **Configurável em runtime**: regras de automação vivem em `Settings` (editáveis
  no painel), não hardcoded.
- **SEO-first**: cada rota pública tem canonical, OG e structured data.

Ver também: [SEO.md](SEO.md) · [AFFILIATE_SYSTEM.md](AFFILIATE_SYSTEM.md) ·
[MARKETPLACE_INTEGRATIONS.md](MARKETPLACE_INTEGRATIONS.md) ·
[DEPLOYMENT.md](DEPLOYMENT.md) · [ROADMAP.md](ROADMAP.md)
