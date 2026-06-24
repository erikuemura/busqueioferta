import type { Category, Marketplace } from "@prisma/client";
import { buildAffiliateUrl } from "@/lib/affiliateLinks";
import { calcDiscountPercent } from "@/lib/utils";
import type { FetchOffersOptions, MarketplaceAdapter, NormalizedOffer } from "./types";

/**
 * Adapter genérico para redes de afiliados que entregam feed CSV (Awin/Lomadee).
 * Cada anunciante (Magazine Luiza, Americanas, Kabum...) expõe seu próprio feed.
 * Configure a URL via env: AWIN_FEED_<MARKETPLACE> (ex: AWIN_FEED_KABUM).
 *
 * Formato CSV esperado (cabeçalho): aw_product_id,product_name,description,
 * merchant_image_url,search_price,rrp_price,aw_deep_link,category_name,
 * in_stock,rating,reviews
 */
function feedEnvKey(marketplace: Marketplace): string {
  return `AWIN_FEED_${marketplace}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = (cells[i] ?? "").trim()));
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function mapCategory(name: string): Category {
  const t = name.toLowerCase();
  if (/game|console/.test(t)) return "GAMES";
  if (/eletr[oô]nico|inform[aá]tica|celular|notebook/.test(t)) return "ELETRONICOS";
  if (/eletrodom/.test(t)) return "ELETRODOMESTICOS";
  if (/moda|vestu/.test(t)) return "VESTUARIO";
  if (/cal[çc]ado|t[êe]nis/.test(t)) return "CALCADOS";
  if (/perfum|cosm/.test(t)) return "PERFUMES_COSMETICOS";
  if (/casa|decora|m[oó]vel/.test(t)) return "CASA_DECORACAO";
  if (/livro/.test(t)) return "LIVROS";
  if (/esporte/.test(t)) return "ESPORTES";
  if (/infantil|brinquedo/.test(t)) return "INFANTIL";
  return "OUTROS";
}

export function createAwinFeedAdapter(marketplace: Marketplace): MarketplaceAdapter {
  return {
    marketplace,

    isConfigured() {
      return Boolean(process.env[feedEnvKey(marketplace)]);
    },

    async fetchOffers(opts: FetchOffersOptions): Promise<NormalizedOffer[]> {
      const feedUrl = process.env[feedEnvKey(marketplace)];
      if (!feedUrl) return [];
      const { minDiscount = 10, limit = 500 } = opts;

      const res = await fetch(feedUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Feed ${marketplace} falhou: ${res.status}`);
      const rows = parseCsv(await res.text());

      return rows
        .slice(0, limit)
        .map((r): NormalizedOffer | null => {
          const current = parseFloat(r.search_price);
          const original = parseFloat(r.rrp_price) || current;
          if (!current) return null;
          const discount = calcDiscountPercent(original, current);
          if (discount < minDiscount) return null;

          return {
            externalId: r.aw_product_id,
            title: r.product_name,
            description: r.description || undefined,
            imageUrl: r.merchant_image_url,
            originalPrice: original,
            currentPrice: current,
            affiliateUrl: buildAffiliateUrl(marketplace, r.aw_deep_link),
            marketplace,
            category: mapCategory(r.category_name ?? ""),
            rating: r.rating ? parseFloat(r.rating) : undefined,
            reviewCount: r.reviews ? parseInt(r.reviews, 10) : undefined,
            stockQuantity: r.in_stock === "1" || /yes|true/i.test(r.in_stock) ? undefined : 0,
          };
        })
        .filter((o): o is NormalizedOffer => o !== null);
    },
  };
}
