/**
 * Autenticação do Mercado Livre.
 *
 * Desde 2024 a busca pública (`/sites/MLB/search`) exige token — sem ele a API
 * responde 403. Aqui resolvemos o token de duas formas, nesta ordem:
 *   1. ML_ACCESS_TOKEN fixo no ambiente (útil p/ testes rápidos)
 *   2. Fluxo OAuth client_credentials com ML_CLIENT_ID + ML_CLIENT_SECRET
 *      (gera um app token e renova sozinho quando expira)
 */
let cached: { token: string; expiresAt: number } | null = null;

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";

export function mlHasCredentials(): boolean {
  return Boolean(process.env.ML_ACCESS_TOKEN || (process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET));
}

export async function getMlToken(): Promise<string | null> {
  if (process.env.ML_ACCESS_TOKEN) return process.env.ML_ACCESS_TOKEN;

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // reusa o token enquanto faltar > 60s para expirar
  if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter token do Mercado Livre: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}
