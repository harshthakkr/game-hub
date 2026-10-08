import axios from "axios";
import type { PsStorePrice } from "@/lib/psStore";

/// Same shape as a PS Store price, so both stores share the listing/snapshot
/// pipeline in lib/prices.ts.
export type StorePrice = PsStorePrice;

export function steamAppUrl(appId: string) {
  return `https://store.steampowered.com/app/${appId}`;
}

/// Steam's public appdetails endpoint, priced for India. It quotes amounts in
/// paise; we store whole rupees like the PS Store. Steam exposes no sale end
/// date here, so saleEndsAt stays null. Returns null when the app isn't sold
/// in India; throws on network/API failure so the caller records the error.
export async function fetchSteamPrice(appId: string): Promise<StorePrice | null> {
  const { data } = await axios.get(
    `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}&cc=in&l=en&filters=basic,price_overview`,
    { timeout: 8000 }
  );
  const entry = data?.[appId];
  if (!entry?.success || !entry.data) return null;
  const info = entry.data as {
    name?: string;
    is_free?: boolean;
    price_overview?: { currency: string; initial: number; final: number };
  };

  if (info.is_free) {
    return {
      productName: info.name ?? null,
      currency: "INR",
      basePrice: 0,
      price: 0,
      isFree: true,
      saleEndsAt: null,
    };
  }
  const overview = info.price_overview;
  if (!overview) return null;
  return {
    productName: info.name ?? null,
    currency: overview.currency,
    basePrice: Math.round(overview.initial / 100),
    price: Math.round(overview.final / 100),
    isFree: false,
    saleEndsAt: null,
  };
}
