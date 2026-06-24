import type { Category } from "@prisma/client";
import { buildAffiliateUrl } from "@/lib/affiliateLinks";
import { calcDiscountPercent } from "@/lib/utils";
import { getMlToken, mlHasCredentials } from "./mlAuth";
import type { FetchOffersOptions, MarketplaceAdapter, NormalizedOffer } from "./types";

const API = "https://api.mercadolibre.com";
const SITE = "MLB";

/** Mapa simples de categorias ML → categorias internas. */
function mapCategory(mlCategoryId: string | undefined, title: string): Category {
  const t = title.toLowerCase();
  if (/(game|console|playstation|xbox|nintendo)/.test(t)) return "GAMES";
  if (/(celular|notebook|fone|tv|monitor|tablet|smart)/.test(t)) return "ELETRONICOS";
  if (/(tênis|tenis|sapato|bota|chinelo)/.test(t)) return "CALCADOS";
  if (/(camiseta|camisa|calça|vestido|jaqueta|moda)/.test(t)) return "VESTUARIO";
  if (/(perfume|maquiagem|batom|cosmético|cosmetico)/.test(t)) return "PERFUMES_COSMETICOS";
  if (/(geladeira|fog|micro-?ondas|lava|fritadeira|airfryer)/.test(t)) return "ELETRODOMESTICOS";
  if (/(livro|book)/.test(t)) return "LIVROS";
  if (/(bicicleta|fitness|academia|suplemento|esporte)/.test(t)) return "ESPORTES";
  return "OUTROS";
}

interface MLSearchItem {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  permalink: string;
  thumbnail: string;
  available_quantity?: number;
  category_id?: string;
  reviews?: { rating_average?: number; total?: number };
}

interface MLSearchResponse {
  results: MLSearchItem[];
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getMlToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const mercadoLivreAdapter: MarketplaceAdapter = {
  marketplace: "MERCADO_LIVRE",

  isConfigured() {
    // A API exige token desde 2024 (resposta 403 sem ele).
    return mlHasCredentials();
  },

  async fetchOffers(opts: FetchOffersOptions): Promise<NormalizedOffer[]> {
    const { query = "ofertas", minDiscount = 10, limit = 50 } = opts;
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });

    const res = await fetch(`${API}/sites/${SITE}/search?${params}`, {
      headers: await authHeaders(),
      // sync roda em worker; sem cache do Next
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Mercado Livre search falhou: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as MLSearchResponse;

    return data.results
      .map((item): NormalizedOffer | null => {
        const original = item.original_price ?? item.price;
        const current = item.price;
        const discount = calcDiscountPercent(original, current);
        if (discount < minDiscount) return null;

        return {
          externalId: item.id,
          title: item.title,
          imageUrl: item.thumbnail?.replace("http://", "https://").replace("-I.", "-O.") ?? "",
          originalPrice: original,
          currentPrice: current,
          affiliateUrl: buildAffiliateUrl("MERCADO_LIVRE", item.permalink),
          marketplace: "MERCADO_LIVRE",
          category: mapCategory(item.category_id, item.title),
          rating: item.reviews?.rating_average,
          reviewCount: item.reviews?.total,
          stockQuantity: item.available_quantity,
        };
      })
      .filter((o): o is NormalizedOffer => o !== null);
  },

  async checkAvailability(externalId: string) {
    const res = await fetch(`${API}/items/${externalId}`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (res.status === 404) return { available: false };
    if (!res.ok) throw new Error(`ML item ${externalId}: ${res.status}`);
    const item = (await res.json()) as { status: string; price: number; available_quantity: number };
    return {
      available: item.status === "active" && item.available_quantity > 0,
      currentPrice: item.price,
    };
  },
};
