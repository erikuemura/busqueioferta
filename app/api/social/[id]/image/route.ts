import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOfferImage, type SocialFormat } from "@/lib/imageGenerator";
import { getCategoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // sharp precisa do runtime Node

/**
 * Gera a arte de divulgação de uma oferta on-the-fly e devolve o PNG.
 *   /api/social/{offerId}/image?format=square|story|landscape
 * Usada no preview do backoffice e pode alimentar o Open Graph dinâmico.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const offer = await prisma.offer.findUnique({ where: { id: params.id } });
  if (!offer) return NextResponse.json({ error: "Oferta não encontrada" }, { status: 404 });

  const format = (req.nextUrl.searchParams.get("format") as SocialFormat) || "square";
  const cat = getCategoryMeta(offer.category);

  try {
    const buffer = await generateOfferImage({
      productImage: offer.imageUrl,
      title: offer.title,
      originalPrice: offer.originalPrice,
      currentPrice: offer.currentPrice,
      discountPercent: offer.discountPercent,
      marketplace: offer.marketplace,
      gradient: cat.gradient,
      format,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha ao gerar imagem", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
