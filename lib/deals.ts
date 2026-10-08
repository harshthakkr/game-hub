import { prisma } from "@/lib/prisma";
import { STORES, summarizeSnapshot, type PriceSummary } from "@/lib/prices";
import type { PriceStore } from "@/app/generated/prisma";

export type BestPrice = PriceSummary & { store: PriceStore; storeLabel: string; atLow: boolean };

const LOW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/// Cheapest current price per game across every tracked store, for the given
/// IGDB ids (or every tracked game when omitted). `atLow` marks a price that
/// is the lowest seen in the last 30 days. Games we don't track are absent.
export async function bestPrices(gameIds?: number[]): Promise<Map<number, BestPrice>> {
  const listings = await prisma.priceListing.findMany({
    where: gameIds ? { gameId: { in: gameIds } } : undefined,
    select: {
      id: true,
      gameId: true,
      store: true,
      snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 },
    },
  });
  const priced = listings.filter((l) => l.snapshots.length > 0);
  const lows = await prisma.priceSnapshot.groupBy({
    by: ["listingId"],
    where: {
      listingId: { in: priced.map((l) => l.id) },
      fetchedAt: { gte: new Date(Date.now() - LOW_WINDOW_MS) },
    },
    _min: { price: true },
  });
  const lowBy = new Map(lows.map((l) => [l.listingId, l._min.price]));

  const best = new Map<number, BestPrice>();
  for (const listing of priced) {
    const snapshot = listing.snapshots[0];
    const summary = summarizeSnapshot(snapshot);
    const current = best.get(listing.gameId);
    if (current && current.amount <= summary.amount) continue;
    best.set(listing.gameId, {
      ...summary,
      store: listing.store,
      storeLabel: STORES[listing.store].label,
      atLow: summary.discountPercent > 0 && snapshot.price <= (lowBy.get(listing.id) ?? Infinity),
    });
  }
  return best;
}

/// Adds `price` to each game we track; leaves the rest untouched. Price data
/// is decoration, so a database failure returns the games as they were.
export async function withPrices<T extends { id?: number }>(games: T[]) {
  try {
    const ids = games.map((g) => g.id).filter((id): id is number => typeof id === "number");
    if (ids.length === 0) return games;
    const prices = await bestPrices(ids);
    return games.map((g) => (g.id && prices.has(g.id) ? { ...g, price: prices.get(g.id) } : g));
  } catch {
    return games;
  }
}
