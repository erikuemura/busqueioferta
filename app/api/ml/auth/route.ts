import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff } from "@/app/admin/guard";
import { mlAuthUrl, generatePkcePair } from "@/lib/marketplaces/mlAuth";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PKCE_COOKIE = "ml_pkce_verifier";

/** Inicia o fluxo OAuth (PKCE) do Mercado Livre (somente equipe). */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!isStaff(role)) {
    return NextResponse.redirect(absoluteUrl("/admin/login"));
  }
  const redirectUri = absoluteUrl("/api/ml/callback");
  const { verifier, challenge } = generatePkcePair();

  const res = NextResponse.redirect(mlAuthUrl(redirectUri, challenge));
  res.cookies.set(PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 min — tempo de sobra para o login no ML
    path: "/api/ml",
  });
  return res;
}
