import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Autenticação do Mercado Livre.
 *
 * A busca (`/sites/MLB/search`) exige TOKEN DE USUÁRIO — o token de aplicação
 * (client_credentials) é recusado com 403. Por isso usamos o fluxo OAuth
 * authorization_code: o dono da conta autoriza uma vez, guardamos o refresh
 * token no banco (Settings) e renovamos o access token automaticamente.
 */
const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
const AUTH_BASE = "https://auth.mercadolivre.com.br/authorization";
const REFRESH_KEY = "mlRefreshToken";

let cached: { token: string; expiresAt: number } | null = null;

export function mlHasCredentials(): boolean {
  return Boolean(process.env.ML_ACCESS_TOKEN || (process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET));
}

async function readSetting(key: string): Promise<string | null> {
  const row = await prisma.settings.findUnique({ where: { key } }).catch(() => null);
  return row?.value ?? null;
}
async function writeSetting(key: string, value: string): Promise<void> {
  await prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } }).catch(() => {});
}

/** Gera o par PKCE (code_verifier / code_challenge, método S256). */
export function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url"); // 43 chars, URL-safe
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function mlAuthUrl(redirectUri: string, codeChallenge: string): string {
  // A API do Mercado Livre (marketplace) não usa parâmetro "scope" — diferente
  // do Mercado Pago. O refresh_token é emitido conforme o fluxo habilitado no
  // app (Configuração e scopes → Fluxos OAuth). PKCE é obrigatório para este app.
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ML_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_BASE}?${params}`;
}

export async function mlIsAuthorized(): Promise<boolean> {
  if (process.env.ML_ACCESS_TOKEN) return true;
  return Boolean(await readSetting(REFRESH_KEY));
}

export interface MlExchangeResult {
  ok: boolean;
  error?: string;
}

/** Troca o code do callback por tokens e guarda o refresh token. */
export async function mlExchangeCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<MlExchangeResult> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ML_CLIENT_ID ?? "",
      client_secret: process.env.ML_CLIENT_SECRET ?? "",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });
  const bodyText = await res.text();
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${bodyText.slice(0, 300)}` };

  let data: { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; token_type?: string };
  try {
    data = JSON.parse(bodyText);
  } catch {
    return { ok: false, error: `Resposta inválida: ${bodyText.slice(0, 300)}` };
  }
  if (!data.refresh_token) {
    // Mostra a resposta real do ML (com o access_token mascarado) para diagnóstico.
    const redacted = { ...data, access_token: data.access_token ? `${data.access_token.slice(0, 10)}...` : undefined };
    return {
      ok: false,
      error: `ML não devolveu refresh_token. Resposta: ${JSON.stringify(redacted)}`,
    };
  }
  await writeSetting(REFRESH_KEY, data.refresh_token);
  cached = { token: data.access_token!, expiresAt: Date.now() + (data.expires_in ?? 21600) * 1000 };
  return { ok: true };
}

export async function getMlToken(): Promise<string | null> {
  if (process.env.ML_ACCESS_TOKEN) return process.env.ML_ACCESS_TOKEN;
  if (cached && cached.expiresAt - Date.now() > 60_000) return cached.token;

  const refresh = await readSetting(REFRESH_KEY);
  if (!refresh || !process.env.ML_CLIENT_ID || !process.env.ML_CLIENT_SECRET) return null;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: refresh,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  // o ML rotaciona o refresh token a cada uso
  if (data.refresh_token) await writeSetting(REFRESH_KEY, data.refresh_token);
  return cached.token;
}
