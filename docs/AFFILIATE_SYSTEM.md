# Sistema de Afiliados — busqueioferta

## Inserção automática de links

`lib/affiliateLinks.ts` → `buildAffiliateUrl(marketplace, rawUrl)` garante a tag de
afiliado em **todo** link de saída (regra de negócio inviolável):

| Marketplace | Parâmetro |
|---|---|
| Mercado Livre | `?matt_tool=ML_AFFILIATE_TOOL_ID` |
| Amazon | `?tag=AMAZON_PARTNER_TAG` |
| Awin (Magalu, Americanas, Kabum, Casas Bahia, Ponto) | `?awinaffid=AWIN_PUBLISHER_ID` |
| Shopee | shortlink próprio gerado pela API |

Aplicado no momento da ingestão (`upsertOffers`) e também disponível via
`provider.generateAffiliateLink()`.

## Rastreamento de cliques

Toda saída passa por **`/api/track/click`**, que:
1. aplica rate limiting (`lib/rateLimit.ts`);
2. incrementa o contador (`offer.clicks` / `coupon.clicks`);
3. grava um **`ClickEvent`** datado com atribuição;
4. redireciona (302) ao link de afiliado.

### Modelo `ClickEvent`
```
type        CLICK | SHARE | VIEW
offerId?    / couponId?
referer, source (host), device (mobile|desktop), country
utmSource, utmMedium, utmCampaign
createdAt
```

Suporta `?utm_source=instagram&utm_medium=social&utm_campaign=...` — assim cada
canal de distribuição leva sua atribuição. O modelo **`Campaign`** permite nomear e
agrupar campanhas.

## Analytics

Dashboard (`/admin/dashboard`) lê `ClickEvent`:
- cliques em **24h / 7d / 30d** (janelas reais, não só contador agregado);
- cliques/ofertas por categoria e por marketplace;
- ofertas expirando, fila social.

### Consultas úteis (futuras telas)
- Top ofertas por clique no período.
- Receita estimada = cliques × CTR×comissão (requer pixel de conversão por rede).
- Atribuição por `utmSource` / `source` (Instagram vs SEO vs Telegram).

## Próximos passos
- **Conversão real**: importar relatórios das redes (Amazon Associates, ML, Awin)
  via API/CSV e casar com `ClickEvent` por janela/SubID.
- Passar um **SubID** único no link (ex.: `clickEvent.id`) para reconciliação 1:1.
- Tela de campanhas e relatório de receita por fonte de tráfego.
