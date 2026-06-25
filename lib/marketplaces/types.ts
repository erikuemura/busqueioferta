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

/** Cupom normalizado por marketplace. */
export interface NormalizedCoupon {
  code: string;
  title: string;
  description?: string;
  discountText?: string;
  affiliateUrl: string;
  marketplace: Marketplace;
  expiresAt?: Date;
}

/**
 * Contrato único que todo provider de marketplace implementa.
 * Métodos opcionais permitem implementação incremental por provider.
 */
export interface MarketplaceProvider {
  marketplace: Marketplace;
  /** Se as credenciais necessárias estão presentes no ambiente. */
  isConfigured(): boolean;
  /** Busca ofertas/produtos e devolve no formato normalizado. */
  fetchOffers(opts: FetchOffersOptions): Promise<NormalizedOffer[]>;
  /** Alias semântico de fetchOffers para buscas por termo. */
  searchProducts?(opts: FetchOffersOptions): Promise<NormalizedOffer[]>;
  /** Detalhe de um produto específico. */
  getProduct?(externalId: string): Promise<NormalizedOffer | null>;
  /** Cupons ativos do marketplace. */
  getCoupons?(): Promise<NormalizedCoupon[]>;
  /** Verifica se um item segue disponível (usado pelo check-offer-status). */
  checkAvailability?(externalId: string): Promise<{ available: boolean; currentPrice?: number }>;
  /** Garante a tag de afiliado na URL de saída. */
  generateAffiliateLink?(rawUrl: string): string;
}

/** @deprecated use MarketplaceProvider — mantido por compatibilidade. */
export type MarketplaceAdapter = MarketplaceProvider;
