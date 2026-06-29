import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * URL de notificações (callback) exigida pelo app do Mercado Livre.
 * Hoje só confirmamos o recebimento (200) — não dependemos de webhooks para a
 * busca de ofertas. Os payloads ficam logados para uso futuro (pedidos, itens...).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  logger.info("ml.notification", { topic: body?.topic, resource: body?.resource });
  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
