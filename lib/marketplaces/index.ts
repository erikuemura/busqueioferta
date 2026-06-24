import type { Marketplace } from "@prisma/client";
import type { MarketplaceAdapter } from "./types";
import { mercadoLivreAdapter } from "./mercadolivre";
import { amazonAdapter } from "./amazon";
import { createAwinFeedAdapter } from "./awinFeed";

export const adapters: Record<string, MarketplaceAdapter> = {
  MERCADO_LIVRE: mercadoLivreAdapter,
  AMAZON: amazonAdapter,
  MAGAZINE_LUIZA: createAwinFeedAdapter("MAGAZINE_LUIZA"),
  AMERICANAS: createAwinFeedAdapter("AMERICANAS"),
  KABUM: createAwinFeedAdapter("KABUM"),
  CASAS_BAHIA: createAwinFeedAdapter("CASAS_BAHIA"),
  PONTO: createAwinFeedAdapter("PONTO"),
};

export function getAdapter(marketplace: Marketplace): MarketplaceAdapter | undefined {
  return adapters[marketplace];
}

/** Adapters com credenciais/feed prontos para rodar agora. */
export function getConfiguredAdapters(): MarketplaceAdapter[] {
  return Object.values(adapters).filter((a) => a.isConfigured());
}

export * from "./types";
