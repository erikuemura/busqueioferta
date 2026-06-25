# Deployment — busqueioferta

## Topologia

| Componente | Onde | Por quê |
|---|---|---|
| Web (Next.js) | **Vercel** | SSR/ISR/SSG serverless |
| Banco | **Prisma Postgres** (Vercel Marketplace) | conexão direta `postgres://` |
| Workers (BullMQ) | **Railway / Render** | precisam de processo contínuo (não rodam no Vercel) |
| Redis | Railway / Upstash | fila dos workers |
| Storage de imagens | local `/public/generated` → migrar p/ Cloudinary/S3 | FS do Vercel é efêmero/somente leitura |

## Web (Vercel) — já em produção
- Repo conectado ao Git → **push na `main` redeploya** automaticamente.
- `npm run build` roda `prisma generate && next build`.
- Env vars de produção: `DATABASE_URL` (do Prisma Postgres), `NEXTAUTH_SECRET`,
  `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`,
  `NEXT_PUBLIC_SOCIAL_HANDLE`.

### Migrations
```bash
# aplicar no banco (uma vez por mudança de schema)
DATABASE_URL=... npx prisma migrate deploy
# seed inicial
DATABASE_URL=... npm run db:seed
```
> Migrations versionadas em `prisma/migrations`. Não use `db push` em produção.

## Workers (Railway/Render)
Serviço separado, mesmo repo:
- Comando: `npm run worker`
- Env: `DATABASE_URL`, `REDIS_URL` + credenciais de social/marketplace usadas.
- Agenda: `sync`(2h), `check-status`(30min), `schedule-social`(horários), `alerts`(4h).

## Variáveis de ambiente
Ver `.env.local.example` (lista completa e comentada). Mínimo para o site:
`DATABASE_URL` + `NEXTAUTH_SECRET`.

## Checklist de produção
- [x] HTTPS + headers de segurança (`next.config.mjs`)
- [x] `robots.txt` + `sitemap.xml`
- [x] Health check `/api/health`
- [x] Migrations versionadas
- [ ] Storage externo para imagens sociais (Cloudinary/S3)
- [ ] Error tracking (Sentry) — ver OBSERVABILITY no ROADMAP
- [ ] Domínio próprio + `NEXT_PUBLIC_SITE_URL` atualizado
- [ ] Workers no Railway/Render com Redis

## Comandos úteis
```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run sync         # puxar ofertas reais sob demanda
npm run worker       # subir os workers (precisa de Redis)
npm run db:studio    # inspecionar o banco
```
