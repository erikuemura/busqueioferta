import type { Category, Marketplace } from "@prisma/client";

/** Oferta normalizada — formato comum produzido por qualquer adapter. */
export interface NormalizedOffer {
  externalId: string;
  externalSku?: string;
  title: string;
  description?: string;
  imageUrl: string;
  originalPrice: number;
  currentPrice: number;
  affiliateUrl: string;
  marketplace: Marketplace;
  category: Category;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number; // quando disponível, para sinalizar LOW_STOCK
  expiresAt?: Date;
}

export interface FetchOffersOptions {
  /** Termo de busca ou categoria do marketplace. */
  query?: string;
  /** Desconto mínimo (%) para já filtrar na origem quando possível. */
  minDiscount?: number;
  limit?: number;
}

export interface MarketplaceAdapter {
  marketplace: Marketplace;
  /** Se as credenciais necessárias estão presentes no ambiente. */
  isConfigured(): boolean;
  /** Busca ofertas e devolve no formato normalizado. */
  fetchOffers(opts: FetchOffersOptions): Promise<NormalizedOffer[]>;
  /** Verifica se um item segue disponível (usado pelo check-offer-status). */
  checkAvailability?(externalId: string): Promise<{ available: boolean; currentPrice?: number }>;
}
