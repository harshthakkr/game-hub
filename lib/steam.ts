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

/// Steam allows multi-app lookups only with filters=price_overview, so this is
/// the bulk path for the daily sweep: up to 100 apps per request.
export const STEAM_BATCH_SIZE = 100;

/// Prices for a batch of apps. An app missing from the result (free, or not
/// sold in India — the batch endpoint can't tell which) should be retried
/// with fetchSteamPrice, which can. No product names here: the batch filter
/// leaves them out. Throws on network/API failure.
export async function fetchSteamPrices(appIds: string[]): Promise<Map<string, StorePrice>> {
  const { data } = await axios.get(
    `https://store.steampowered.com/api/appdetails?appids=${appIds.map(encodeURIComponent).join(",")}&cc=in&filters=price_overview`,
    { timeout: 15000 }
  );
  const prices = new Map<string, StorePrice>();
  for (const appId of appIds) {
    const overview = data?.[appId]?.data?.price_overview as
      | { currency: string; initial: number; final: number }
      | undefined;
    if (!overview) continue;
    prices.set(appId, {
      productName: null,
      currency: overview.currency,
      basePrice: Math.round(overview.initial / 100),
      price: Math.round(overview.final / 100),
      isFree: false,
      saleEndsAt: null,
    });
  }
  return prices;
}
