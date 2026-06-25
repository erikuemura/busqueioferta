import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, PUBLIC_MARKETPLACES } from "@/lib/categories";
import { SEO_TERMS } from "@/lib/terms";

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

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/cupons`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/alertas`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryRoutes = CATEGORIES.map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const termRoutes = SEO_TERMS.map((t) => ({
    url: `${base}/ofertas/${t.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const couponRoutes = PUBLIC_MARKETPLACES.map((m) => ({
    url: `${base}/cupons/${m.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const offerRoutes = offers.map((o) => ({
    url: `${base}/oferta/${o.id}`,
    lastModified: o.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...termRoutes, ...couponRoutes, ...offerRoutes];
}
