import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { calcDiscountPercent } from "@/lib/utils";
import { buildAffiliateUrl } from "@/lib/affiliateLinks";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * Captura client-side (bookmarklet): recebe dados já extraídos pelo NAVEGADOR
 * do usuário — a leitura da página acontece no navegador dele, não no nosso
 * servidor. Aqui só recebemos o payload e criamos a oferta como rascunho.
 *
 * Autenticação: token de captura (gerado em /admin/ofertas/capturar), embutido
 * no próprio bookmarklet — não usa cookies de sessão (a chamada é cross-site,
 * feita a partir da página do marketplace).
 */
const schema = z.object({
  token: z.string().min(10),
  url: z.string().url(),
  title: z.string().min(1).max(300),
  imageUrl: z.string().url().optional().or(z.literal("")),
  currentPrice: z.number().positive(),
  originalPrice: z.number().positive().optional(),
});

function marketplaceFromUrl(url: string): "MERCADO_LIVRE" | "MANUAL" {
  try {
    const host = new URL(url).host;
    if (host.includes("mercadolivre") || host.includes("mercadolibre") || host.includes("meli.")) {
      return "MERCADO_LIVRE";
    }
  } catch {
    /* url inválida cai no schema.parse */
  }
  return "MANUAL";
}

export async function POST(req: NextRequest) {
  // CORS: o bookmarklet roda a partir do domínio do marketplace.
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const rl = rateLimit(clientKey(req, "capture"), 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate limited" }, { status: 429, headers: cors });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400, headers: cors });
  }
  const { token, url, title, imageUrl, currentPrice } = parsed.data;
  const originalPrice = parsed.data.originalPrice ?? currentPrice;

  const validToken = await getSetting("captureToken");
  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401, headers: cors });
  }

  const marketplace = marketplaceFromUrl(url);
  const affiliateUrl = buildAffiliateUrl(marketplace, url);
  const discountPercent = calcDiscountPercent(originalPrice, currentPrice);

  const offer = await prisma.offer.create({
    data: {
      title,
      imageUrl: imageUrl || "https://via.placeholder.com/400",
      originalPrice,
      currentPrice,
      discountPercent,
      affiliateUrl,
      marketplace,
      category: "OUTROS",
      status: "DRAFT",
      capturedVia: "bookmarklet",
    },
  });

  return NextResponse.json({ ok: true, offerId: offer.id, editUrl: `/admin/ofertas/${offer.id}/editar` }, { headers: cors });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
