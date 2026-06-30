import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff } from "@/app/admin/guard";
import { mlAuthUrl } from "@/lib/marketplaces/mlAuth";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Inicia o fluxo OAuth do Mercado Livre (somente equipe). */
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!isStaff(role)) {
    return NextResponse.redirect(absoluteUrl("/admin/login"));
  }
  const redirectUri = absoluteUrl("/api/ml/callback");
  return NextResponse.redirect(mlAuthUrl(redirectUri));
}
