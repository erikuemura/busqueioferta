import type { MarketplaceAdapter, NormalizedOffer, FetchOffersOptions } from "./types";

/**
 * Stub da Amazon Product Advertising API 5.0.
 *
 * A PA-API exige assinatura AWS SigV4 e aprovação no Amazon Associates com
 * vendas mínimas. Para o MVP deixamos o adapter pronto para receber a
 * implementação de `SearchItems`; sem credenciais ele simplesmente não roda.
 *
 * Quando for implementar:
 *  - Endpoint: POST https://${AMAZON_HOST}/paapi5/searchitems
 *  - Headers: x-amz-target=...SearchItems, Content-Encoding: amz-1.0
 *  - Assinar com AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY (SigV4, região us-east-1)
 *  - Resources: ItemInfo.Title, Images.Primary.Large, Offers.Listings.Price,
 *    Offers.Listings.SavingBasis, CustomerReviews.StarRating
 */
export const amazonAdapter: MarketplaceAdapter = {
  marketplace: "AMAZON",

  isConfigured() {
    return Boolean(
      process.env.AMAZON_ACCESS_KEY &&
        process.env.AMAZON_SECRET_KEY &&
        process.env.AMAZON_PARTNER_TAG,
    );
  },

  async fetchOffers(_opts: FetchOffersOptions): Promise<NormalizedOffer[]> {
    if (!this.isConfigured()) return [];
    throw new Error(
      "Amazon PA-API ainda não implementada. Configure as credenciais e implemente SearchItems em lib/marketplaces/amazon.ts.",
    );
  },
};
