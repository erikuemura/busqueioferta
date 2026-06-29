import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Redirect URI exigida pelo app do Mercado Livre. Não usamos o fluxo de login
 * (authorization code) — a busca roda via client_credentials —, então este
 * endpoint apenas confirma a configuração.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  return NextResponse.json({ ok: true, received: Boolean(code) });
}
