import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Resiliente: se o banco estiver indisponível (ex.: build sem DB), gera ao
  // menos as rotas estáticas em vez de quebrar o export.
  let offers: { id: string; updatedAt: Date }[] = [];
  try {
    offers = await prisma.offer.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
  } catch {
    offers = [];
  }

  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/alertas`, changeFrequency: "monthly", priority: 0.5 },
    ...CATEGORIES.map((c) => ({
      url: `${base}/categoria/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...offers.map((o) => ({
      url: `${base}/oferta/${o.id}`,
      lastModified: o.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
