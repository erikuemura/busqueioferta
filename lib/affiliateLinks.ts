import type { Marketplace } from "@prisma/client";

/**
 * Garante que TODO link de saída carregue a tag de afiliado correspondente
 * ao marketplace. Regra de negócio #8: nunca redirecionar sem tag.
 */
export function buildAffiliateUrl(marketplace: Marketplace, rawUrl: string): string {
  try {
    const url = new URL(rawUrl);

    switch (marketplace) {
      case "MERCADO_LIVRE": {
        const tool = process.env.ML_AFFILIATE_TOOL_ID;
        if (tool) url.searchParams.set("matt_tool", tool);
        break;
      }
      case "AMAZON": {
        const tag = process.env.AMAZON_PARTNER_TAG;
        if (tag) url.searchParams.set("tag", tag);
        break;
      }
      case "MAGAZINE_LUIZA":
      case "AMERICANAS":
      case "KABUM":
      case "CASAS_BAHIA":
      case "PONTO": {
        // Awin: deeplink via publisher id (awinmid/awinaffid).
        const affid = process.env.AWIN_PUBLISHER_ID;
        if (affid && !url.searchParams.has("awinaffid")) {
          url.searchParams.set("awinaffid", affid);
        }
        break;
      }
      case "SHOPEE": {
        // Shopee usa shortlink próprio gerado pela API; mantemos a URL como veio.
        break;
      }
      default:
        break;
    }

    return url.toString();
  } catch {
    // URL inválida — devolve como veio para não quebrar o redirecionamento.
    return rawUrl;
  }
}

/**
 * Anexa um SubID (ex.: id do ClickEvent) ao link de afiliado usando o parâmetro
 * que cada rede reconhece em seus relatórios — permite reconciliar a conversão
 * com a origem do tráfego (categoria, UTM, canal).
 */
export function appendSubId(marketplace: Marketplace, rawUrl: string, subId: string): string {
  if (!subId) return rawUrl;
  try {
    const url = new URL(rawUrl);
    const param =
      marketplace === "AMAZON"
        ? "ascsubtag"
        : marketplace === "MERCADO_LIVRE"
          ? "matt_word"
          : marketplace === "MAGAZINE_LUIZA" ||
              marketplace === "AMERICANAS" ||
              marketplace === "KABUM" ||
              marketplace === "CASAS_BAHIA" ||
              marketplace === "PONTO"
            ? "clickref" // Awin
            : "subid";
    if (!url.searchParams.has(param)) url.searchParams.set(param, subId);
    return url.toString();
  } catch {
    return rawUrl;
  }
}
