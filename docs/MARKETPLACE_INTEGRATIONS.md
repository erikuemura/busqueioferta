# Integrações de Marketplace — busqueioferta

## Contrato (`lib/marketplaces/types.ts`)

```ts
interface MarketplaceProvider {
  marketplace: Marketplace
  isConfigured(): boolean
  fetchOffers(opts): Promise<NormalizedOffer[]>
  searchProducts?(opts): Promise<NormalizedOffer[]>
  getProduct?(externalId): Promise<NormalizedOffer | null>
  getCoupons?(): Promise<NormalizedCoupon[]>
  checkAvailability?(externalId): Promise<{ available; currentPrice? }>
  generateAffiliateLink?(rawUrl): string
}
```

Todos os providers produzem `NormalizedOffer` (formato comum), o que dá:
**normalização**, **deduplicação** (`@@unique([marketplace, externalId])`),
scoring e persistência unificados em `lib/sync.ts`.

## Providers

| Provider | Arquivo | Estado | Auth |
|---|---|---|---|
| Mercado Livre | `mercadolivre.ts` | ✅ funcional | OAuth `client_credentials` (`ML_CLIENT_ID/SECRET`) — auto-renova token (`mlAuth.ts`) |
| Amazon | `amazon.ts` | 🟡 stub pronto | PA-API 5.0 (SigV4) — `AMAZON_ACCESS_KEY/SECRET/PARTNER_TAG` |
| Awin (Magalu, Americanas, Kabum, Casas Bahia, Ponto) | `awinFeed.ts` | ✅ funcional (feed CSV) | `AWIN_FEED_<MARKETPLACE>` (URL do feed) |
| Shopee | — | ⬜ planejado | Shopee Affiliate API |

> O Mercado Livre exige token desde 2024 (busca pública retorna 403); por isso
> `isConfigured()` exige credenciais.

## Pipeline de ingestão

```
provider.fetchOffers()  →  NormalizedOffer[]
        │
        ▼  lib/sync.ts upsertOffers()
   filtra desconto < mínimo
   calcula score (lib/scoring.ts)
   define status ACTIVE/DRAFT pelo threshold
   dedup por (marketplace, externalId)
   persiste / atualiza
```

## Como rodar
- **Sob demanda (sem Redis)**: `npm run sync` ou `npm run sync -- "termo"`.
- **Agendado (2h)**: worker `sync-marketplace` (BullMQ) — ver DEPLOYMENT.md.

## Confiabilidade
- **Retry**: BullMQ reexecuta jobs falhos (configurável por fila).
- **Rate limiting / cache**: chamadas com `cache: "no-store"` no sync; token ML
  cacheado até expirar. Para escalar, adicionar fila dedicada por provider e backoff.
- **check-offer-status** (30 min): marca `OUT_OF_STOCK`/`EXPIRED` via
  `checkAvailability` + contagem de "não encontrado".

## Adicionando um novo marketplace
1. Implemente `MarketplaceProvider` em `lib/marketplaces/<nome>.ts`.
2. Registre em `lib/marketplaces/index.ts` (`adapters`).
3. Adicione o valor ao enum `Marketplace` (migration) e a tag em `affiliateLinks.ts`.
4. (Opcional) cor/slug em `lib/categories.ts` (`MARKETPLACES`).
