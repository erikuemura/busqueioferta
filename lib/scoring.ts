import type { NormalizedOffer } from "./marketplaces/types";
import { calcDiscountPercent } from "./utils";

/**
 * Score de relevância (0–100):
 *   desconto% * 0.4 + rating(0–5→0–100) * 0.3 + reviewCount_normalizado * 0.3
 * reviewCount é normalizado em escala log (1000+ avaliações ≈ topo).
 */
export function computeScore(offer: NormalizedOffer): number {
  const discount = calcDiscountPercent(offer.originalPrice, offer.currentPrice);
  const ratingScore = ((offer.rating ?? 0) / 5) * 100;
  const reviews = offer.reviewCount ?? 0;
  const reviewScore = Math.min(100, (Math.log10(reviews + 1) / 3) * 100); // 1000 reviews → ~100

  const score = discount * 0.4 + ratingScore * 0.3 + reviewScore * 0.3;
  return Math.round(score * 10) / 10;
}
