# Roadmap — busqueioferta

## ✅ Concluído

### MVP
Site público, backoffice com auth, integração Mercado Livre, feed Awin, gerador de
arte social, compartilhamento WhatsApp, SEO básico, deploy no Vercel + Postgres.

### Fase 2
- Analytics com cliques datados (`ClickEvent`, dashboard 24h/7d/30d).
- OAuth Mercado Livre + `npm run sync`.
- Migrations versionadas.
- Publicação automática agendada (score, dedup, limites diários).
- Providers sociais: Instagram, TikTok, Telegram, WhatsApp, **Facebook, Pinterest**.

### Fase 3 (SEO + visual + arquitetura)
- **SEO técnico**: robots, canonical, OG/Twitter, Organization/WebSite/Breadcrumb/
  Product/ItemList/FAQ schema.
- **SEO programático**: `/ofertas/[termo]`, `/cupons/[marketplace]`, sitemap escalável.
- **Cupons**: modelo, páginas, card, seção na home.
- **Visual**: card repaginado (economia R$/%, badges quente/melhor preço/últimas,
  rating, prova social), seções "mais acessadas" e "cupons populares", footer com
  linkagem interna.
- **Provider abstraction**: contrato `MarketplaceProvider` completo.
- **Observabilidade**: logger estruturado, `/api/health`.
- **Segurança**: headers, rate limiting, validação (zod), `nofollow sponsored`.

## 🔜 Próximos passos prioritários

1. **Workers em produção** (Railway/Render + Redis) → automação real de sync e
   publicação social.
2. **Storage externo** (Cloudinary/S3) para artes sociais — substitui `/public/generated`.
3. **Amazon PA-API** (implementar `SearchItems` com SigV4) e **Shopee Affiliate**.
4. **Conversão de afiliados**: SubID por clique + import de relatórios das redes.
5. **Error tracking** (Sentry) e métricas (OpenTelemetry/Vercel Analytics).
6. **Conteúdo**: guias de compra, comparativos, histórico de preços (SEO topo de funil).
7. **Domínio próprio** + perfis sociais oficiais.

## 💡 Backlog / ideias
- PWA do backoffice.
- Score de relevância por nicho/perfil de público.
- Alertas de preço por produto (watchlist do usuário) + push/e-mail.
- A/B test de copy de CTA e templates sociais.
- Geração de `SEO_TERMS` a partir do Google Search Console.
- Newsletter automática (digest diário das melhores ofertas).
- Programa de "deal hunter" (curadoria comunitária estilo Promobit).
