# busqueioferta

Agregador de ofertas e descontos dos principais marketplaces do Brasil, com
monetização via programas de afiliados e distribuição automatizada nas redes
sociais. Diferencial: **curadoria inteligente por nicho + relevância** (score
combinando desconto, reputação e volume de avaliações), não só preço.

## Stack

- **Next.js 14** (App Router) + **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **NextAuth** (credenciais) para o backoffice
- **BullMQ + Redis** para jobs/automação
- **Sharp** para geração das artes sociais
- Deploy sugerido: Vercel (web) + Railway/Render (workers)

## Rodando localmente (MVP)

Pré-requisitos: Node 20+, Docker (para Postgres + Redis) ou um Postgres próprio.

```bash
# 1. Subir banco e Redis
docker compose up -d

# 2. Variáveis de ambiente
cp .env.local.example .env.local
#   Para o MVP basta DATABASE_URL e NEXTAUTH_SECRET já preenchidos no exemplo.
#   Gere um secret: openssl rand -base64 32

# 3. Dependências + schema (migrations versionadas) + seed (20 ofertas + admin)
npm install
npm run db:deploy   # aplica prisma/migrations (ou `npm run db:migrate` em dev)
npm run db:seed

# 4. Subir o site
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin
  - login padrão do seed: **admin@busqueioferta.com.br** / **admin123**

### Workers (automação)

Precisam do Redis (sobe junto no docker-compose). Em outro terminal:

```bash
npm run worker
```

Isso registra os jobs agendados e os processadores:

| Job                     | Frequência | O que faz                                                        |
| ----------------------- | ---------- | ---------------------------------------------------------------- |
| `sync-marketplace`      | 2h         | Busca ofertas, normaliza, calcula score, deduplica e persiste     |
| `check-offer-status`    | 30min      | Expira por data/indisponibilidade, atualiza estoque               |
| `generate-social-image` | sob demanda| Gera a arte (feed/story) com Sharp e salva em `/public/generated` |
| `publish-social`        | sob demanda| Publica na rede (WhatsApp/Instagram/Telegram/TikTok)              |
| `send-alert-emails`     | 4h         | Envia digest de ofertas por categoria (Resend)                    |

> Sem `REDIS_URL` o site funciona normalmente; apenas a automação fica inativa.
> Ações de "Publicar" no painel criam o `SocialPost` em `PENDING` e a arte pode
> ser pré-visualizada via `/api/social/{offerId}/image`.

### Puxar ofertas reais sob demanda (sem Redis)

`npm run sync` roda os adapters configurados uma vez e grava as ofertas no banco
— ideal para popular com promoções reais sem subir os workers:

```bash
npm run sync                      # usa os termos das configurações
npm run sync -- "fone bluetooth"  # busca um termo específico
npm run sync -- --limit 80        # nº de itens por termo
```

Para o **Mercado Livre** funcionar (a API exige token desde 2024), crie um app
grátis em https://developers.mercadolivre.com.br e coloque no `.env.local`:

```env
ML_CLIENT_ID=seu_app_id
ML_CLIENT_SECRET=seu_secret
```

O sistema gera e renova o token sozinho via OAuth `client_credentials`
(`lib/marketplaces/mlAuth.ts`). Para os feeds Awin, defina `AWIN_FEED_KABUM`, etc.

## Estrutura

```
app/(public)        site público (home, categoria, oferta, alertas)
app/admin           backoffice protegido (dashboard, ofertas, social, config)
app/api             track/click, offers, alerts, auth, social image
lib/                prisma, scoring, sync, settings, affiliateLinks
lib/marketplaces/   adapters (mercadolivre real, amazon stub, awinFeed CSV)
lib/social/         whatsapp, instagram, tiktok, telegram
workers/            processadores BullMQ + agendador
prisma/             schema + seed
```

## Integrações

- **Mercado Livre** — `api.mercadolibre.com`. Exige token (a busca pública responde
  403 desde 2024); resolvido por OAuth `client_credentials` automático com
  `ML_CLIENT_ID`/`ML_CLIENT_SECRET`. Link de afiliado via `?matt_tool=`.
- **Amazon PA-API** — adapter pronto (stub) aguardando credenciais/assinatura SigV4.
- **Awin / Lomadee** (Magazine Luiza, Americanas, Kabum, Casas Bahia, Ponto) —
  parser de feed CSV. Configure a URL por loja: `AWIN_FEED_KABUM`, etc.
- **Shopee** — shortlink próprio gerado pela API de afiliados.

Chaves ficam em `.env.local` (ver `.env.local.example`). Nunca são commitadas.

## Regras de negócio (configuráveis em /admin/configuracoes)

- Desconto mínimo para publicar: 15%
- Score mínimo para entrar ACTIVE (senão DRAFT)
- Deduplicação por `(marketplace, externalId)` + janela de 7 dias
- Expiração após N verificações sem encontrar o produto
- Limites diários de publicação (Instagram 8, TikTok 4) e horários (7/12/18/21h)
- **Todo link de saída recebe a tag de afiliado** (`lib/affiliateLinks.ts`)

## SEO

- `sitemap.xml` dinâmico, Open Graph por oferta, Schema.org `Product`/`Offer`,
  ISR de 15min nas páginas públicas.

## Deploy

1. **Web (Vercel):** importe o repo, configure as variáveis de ambiente, aponte
   `DATABASE_URL` para um Postgres gerenciado (Supabase/Railway/Neon). `npm run build`
   roda `prisma generate` automaticamente. Rode `prisma migrate deploy` no provisionamento.
2. **Workers (Railway/Render):** serviço separado com `npm run worker`, mesmas
   variáveis + `REDIS_URL`.
3. Troque o storage local `/public/generated` por Cloudinary/Supabase Storage em
   produção (ver `workers/generateSocialImage.ts`).

## Roadmap (Fase 2)

Já implementado: **analytics com eventos de clique datados** (modelo `ClickEvent`,
dashboard com 24h/7d/30d); **auth OAuth do Mercado Livre** + `npm run sync`;
**migrations versionadas** (`prisma/migrations`, `npm run db:deploy`);
**publicação automática agendada** (`lib/scheduler.ts` + worker `schedule-social`)
nos horários configurados, com score mínimo, deduplicação e limites diários por
plataforma (IG 8/dia, TikTok 4/dia). Instagram (Graph API), Telegram (Bot API) e
**TikTok** (Content Posting API, modo PHOTO: init + polling, `TIKTOK_PRIVACY_LEVEL`)
publicam quando há credenciais; botão "Publicar automaticamente agora" no painel.

Pendente: score de relevância por nicho avançado, PWA do backoffice.
