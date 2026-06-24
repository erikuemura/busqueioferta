import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

/** Lista pública de ofertas em JSON (autocomplete/busca/integrações). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const categorySlug = sp.get("categoria");
  const take = Math.min(50, Number(sp.get("limit")) || 20);
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const cat = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  const where: Prisma.OfferWhereInput = {
    status: "ACTIVE",
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(cat ? { category: cat.value } : {}),
  };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      orderBy: [{ featured: "desc" }, { score: "desc" }],
      take,
      skip: (page - 1) * take,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        currentPrice: true,
        originalPrice: true,
        discountPercent: true,
        marketplace: true,
        category: true,
      },
    }),
    prisma.offer.count({ where }),
  ]);

  return NextResponse.json({ offers, total, page });
}
