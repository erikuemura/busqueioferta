import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Health check: status do processo + conectividade com o banco. */
export async function GET() {
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {};

  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, ms: Date.now() - start };
  } catch (err) {
    checks.database = { ok: false, error: (err as Error).message };
  }

  const redisConfigured = Boolean(process.env.REDIS_URL);
  checks.queue = { ok: true, error: redisConfigured ? undefined : "REDIS_URL ausente (workers inativos)" };

  const healthy = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
