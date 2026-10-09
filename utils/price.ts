import type { BestPriceInfo, PriceInfo } from "@/utils/types";

export const STORE_SHORT = { PLAYSTATION: "PS", STEAM: "Steam" } as const;

/// "-30%" when on sale, else null.
export function discountLabel(price?: PriceInfo | null) {
  return price && price.discountPercent > 0 ? `-${price.discountPercent}%` : null;
}

/// One-line context for a sale price, limited to what tracking can prove: we
/// keep 30 days of history, so there is no "all-time low" claim.
export function saleNote(price?: BestPriceInfo | null) {
  if (!price || price.discountPercent <= 0) return null;
  return price.atLow ? "Lowest in 30 days" : `On sale on ${price.storeLabel}`;
}
