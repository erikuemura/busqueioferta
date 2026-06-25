/**
 * Rate limiting simples por janela fixa, em memória (por instância).
 * Suficiente para proteger endpoints públicos (track/click, alerts) contra abuso.
 * Em produção multi-instância, troque o store por Redis/Upstash (mesma interface).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit = 30, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count++;
  const ok = bucket.count <= limit;
  return { ok, remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
}

/** Extrai um identificador estável do request (IP via headers de proxy). */
export function clientKey(req: Request, scope = "default"): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

// Limpeza periódica para não vazar memória.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of store) if (b.resetAt < now) store.delete(k);
  }, 5 * 60_000).unref?.();
}
