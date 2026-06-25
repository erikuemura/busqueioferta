/**
 * Logger estruturado (JSON em produção, legível em dev).
 * Uso: logger.info("sync.done", { created: 5 }) → linha JSON com timestamp/level.
 */
type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level) || (process.env.NODE_ENV === "production" ? "info" : "debug");

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;
  const entry = { ts: new Date().toISOString(), level, msg, ...meta };

  if (process.env.NODE_ENV === "production") {
    // linha única JSON — fácil de ingerir em Datadog/Logtail/Vercel logs
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`[${level}] ${msg}`, meta ?? "");
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, err?: unknown, meta?: Record<string, unknown>) =>
    emit("error", msg, { ...meta, error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err }),
  /** Mede a duração de uma operação assíncrona e loga ao final. */
  async time<T>(msg: string, fn: () => Promise<T>, meta?: Record<string, unknown>): Promise<T> {
    const start = Date.now();
    try {
      const out = await fn();
      emit("info", msg, { ...meta, ms: Date.now() - start, ok: true });
      return out;
    } catch (err) {
      emit("error", msg, { ...meta, ms: Date.now() - start, ok: false, error: (err as Error).message });
      throw err;
    }
  },
};
