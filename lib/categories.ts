import type { Category, Marketplace } from "@prisma/client";

export interface CategoryMeta {
  value: Category;
  slug: string;
  label: string;
  icon: string; // emoji para navegação rápida
  gradient: [string, string]; // usado no gerador de imagem social
}

export const CATEGORIES: CategoryMeta[] = [
  { value: "ELETRONICOS", slug: "eletronicos", label: "Eletrônicos", icon: "📱", gradient: ["#0EA5E9", "#1E3A8A"] },
  { value: "GAMES", slug: "games", label: "Games", icon: "🎮", gradient: ["#7C3AED", "#2E1065"] },
  { value: "VESTUARIO", slug: "vestuario", label: "Moda", icon: "👕", gradient: ["#EC4899", "#831843"] },
  { value: "CALCADOS", slug: "calcados", label: "Calçados", icon: "👟", gradient: ["#F97316", "#7C2D12"] },
  { value: "PERFUMES_COSMETICOS", slug: "perfumes-cosmeticos", label: "Perfumes & Cosméticos", icon: "💄", gradient: ["#DB2777", "#500724"] },
  { value: "ELETRODOMESTICOS", slug: "eletrodomesticos", label: "Eletrodomésticos", icon: "🔌", gradient: ["#0D9488", "#134E4A"] },
  { value: "CASA_DECORACAO", slug: "casa-decoracao", label: "Casa & Decoração", icon: "🛋️", gradient: ["#65A30D", "#1A2E05"] },
  { value: "LIVROS", slug: "livros", label: "Livros", icon: "📚", gradient: ["#CA8A04", "#451A03"] },
  { value: "ESPORTES", slug: "esportes", label: "Esportes", icon: "⚽", gradient: ["#16A34A", "#052E16"] },
  { value: "INFANTIL", slug: "infantil", label: "Infantil", icon: "🧸", gradient: ["#F59E0B", "#78350F"] },
  { value: "ALIMENTOS", slug: "alimentos", label: "Alimentos", icon: "🍫", gradient: ["#DC2626", "#450A0A"] },
  { value: "OUTROS", slug: "outros", label: "Outros", icon: "🛍️", gradient: ["#475569", "#0F172A"] },
];

const categoryBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const categoryByValue = new Map(CATEGORIES.map((c) => [c.value, c]));

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return categoryBySlug.get(slug);
}

export function getCategoryMeta(value: Category): CategoryMeta {
  return categoryByValue.get(value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export interface MarketplaceMeta {
  value: Marketplace;
  label: string;
  color: string;
}

export const MARKETPLACES: MarketplaceMeta[] = [
  { value: "MERCADO_LIVRE", label: "Mercado Livre", color: "#FFE600" },
  { value: "AMAZON", label: "Amazon", color: "#FF9900" },
  { value: "MAGAZINE_LUIZA", label: "Magazine Luiza", color: "#0086FF" },
  { value: "SHOPEE", label: "Shopee", color: "#EE4D2D" },
  { value: "AMERICANAS", label: "Americanas", color: "#E60014" },
  { value: "KABUM", label: "Kabum", color: "#FF6500" },
  { value: "CASAS_BAHIA", label: "Casas Bahia", color: "#003DA5" },
  { value: "PONTO", label: "Ponto", color: "#E4002B" },
  { value: "MANUAL", label: "Manual", color: "#64748B" },
];

const marketplaceByValue = new Map(MARKETPLACES.map((m) => [m.value, m]));

export function getMarketplaceMeta(value: Marketplace): MarketplaceMeta {
  return marketplaceByValue.get(value) ?? MARKETPLACES[MARKETPLACES.length - 1];
}
