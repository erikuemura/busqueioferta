import { NextResponse } from "next/server";

// Rota de diagnóstico temporária — não expõe segredos, só metadados.
export const dynamic = "force-dynamic";

export async function GET() {
  const cid = process.env.ML_CLIENT_ID ?? "";
  const sec = process.env.ML_CLIENT_SECRET ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return NextResponse.json({
    ML_CLIENT_ID_len: cid.length,
    ML_CLIENT_ID_sample: cid ? `${cid.slice(0, 4)}...${cid.slice(-4)}` : null,
    ML_CLIENT_SECRET_set: sec.length > 0,
    ML_CLIENT_SECRET_len: sec.length,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    computed_redirect_uri: new URL("/api/ml/callback", siteUrl || "https://busqueioferta.vercel.app").toString(),
  });
}
