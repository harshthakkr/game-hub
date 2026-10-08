import { prisma } from "@/lib/prisma";
import { fetchPsStorePrice, psStoreConceptUrl } from "@/lib/psStore";
import { fetchSteamPrice, steamAppUrl } from "@/lib/steam";
import type { PriceListing, PriceSnapshot, PriceStore } from "@/app/generated/prisma";

/// A listing counts as fresh for this long; the hourly cron refreshes anything
/// older, and a page view triggers a background refresh past it.
export const PRICE_TTL_MS = 55 * 60 * 1000;
/// Games nobody has opened (or collected) for this long stop being polled.
const ACTIVE_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
/// Hourly samples are kept this long, which is plenty for the 30-day view.
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const CRON_CONCURRENCY = 4;

export const isStale = (fetchedAt: Date | null | undefined) =>
  !fetchedAt || Date.now() - fetchedAt.getTime() > PRICE_TTL_MS;

/// Per-store plumbing: how to fetch a price, where the product page lives, and
/// what to call the store in the UI.
export const STORES: Record<
  PriceStore,
  {
    label: string;
    fetch: (externalId: string) => ReturnType<typeof fetchPsStorePrice>;
    url: (externalId: string) => string;
    missing: string;
  }
> = {
  PLAYSTATION: {
    label: "PlayStation Store",
    fetch: fetchPsStorePrice,
    url: psStoreConceptUrl,
    missing: "Not sold on PS Store India",
  },
  STEAM: {
    label: "Steam",
    fetch: fetchSteamPrice,
    url: steamAppUrl,
    missing: "Not sold on Steam India",
  },
};

/// Registers (or bumps) a store listing for a game the user is looking at.
export function trackListing(
  game: { id: number; slug: string },
  store: PriceStore,
  externalId: string
) {
  return prisma.priceListing.upsert({
    where: { gameId_store: { gameId: game.id, store } },
    create: { store, gameId: game.id, gameSlug: game.slug, externalId },
    update: { lastViewedAt: new Date(), gameSlug: game.slug, externalId },
  });
}

export function latestSnapshot(listingId: string) {
  return prisma.priceSnapshot.findFirst({
    where: { listingId },
    orderBy: { fetchedAt: "desc" },
  });
}

/// Scrapes the store once and records a snapshot. Failures are stored on the
/// listing rather than thrown, so one broken game never stalls a cron run.
export async function refreshListing(
  listing: Pick<PriceListing, "id" | "externalId" | "store">
): Promise<PriceSnapshot | null> {
  const now = new Date();
  const store = STORES[listing.store];
  try {
    const price = await store.fetch(listing.externalId);
    if (!price) {
      await prisma.priceListing.update({
        where: { id: listing.id },
        data: { lastFetchedAt: now, lastError: store.missing },
      });
      return null;
    }
    const [snapshot] = await prisma.$transaction([
      prisma.priceSnapshot.create({
        data: {
          listingId: listing.id,
          fetchedAt: now,
          currency: price.currency,
          basePrice: price.basePrice,
          price: price.price,
          isFree: price.isFree,
          saleEndsAt: price.saleEndsAt,
        },
      }),
      prisma.priceListing.update({
        where: { id: listing.id },
        data: { lastFetchedAt: now, lastError: null, productName: price.productName },
      }),
    ]);
    return snapshot;
  } catch (error) {
    await prisma.priceListing
      .update({
        where: { id: listing.id },
        data: { lastFetchedAt: now, lastError: (error as Error).message.slice(0, 500) },
      })
      .catch(() => {});
    return null;
  }
}

/// Refreshes every active listing that has gone stale, oldest first, stopping
/// once `budgetMs` is spent so the serverless function never times out — any
/// leftovers are simply first in line next hour.
export async function refreshDueListings(budgetMs: number) {
  const startedAt = Date.now();
  const collected = await prisma.collectionItem.findMany({
    distinct: ["gameId"],
    select: { gameId: true },
  });
  const due = await prisma.priceListing.findMany({
    where: {
      AND: [
        {
          OR: [
            { lastViewedAt: { gte: new Date(startedAt - ACTIVE_WINDOW_MS) } },
            { gameId: { in: collected.map((c) => c.gameId) } },
          ],
        },
        {
          OR: [
            { lastFetchedAt: null },
            { lastFetchedAt: { lt: new Date(startedAt - PRICE_TTL_MS) } },
          ],
        },
      ],
    },
    orderBy: { lastFetchedAt: { sort: "asc", nulls: "first" } },
    select: { id: true, externalId: true, store: true },
  });

  let refreshed = 0;
  let failed = 0;
  const queue = [...due];
  const worker = async () => {
    while (queue.length && Date.now() - startedAt < budgetMs) {
      const listing = queue.shift()!;
      if (await refreshListing(listing)) refreshed++;
      else failed++;
    }
  };
  await Promise.all(Array.from({ length: CRON_CONCURRENCY }, worker));

  const { count: pruned } = await prisma.priceSnapshot.deleteMany({
    where: { fetchedAt: { lt: new Date(startedAt - RETENTION_MS) } },
  });

  return { due: due.length, refreshed, failed, skipped: queue.length, pruned };
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number, currency: string) {
  if (currency === "INR") return inr.format(amount);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

export type PriceSummary = ReturnType<typeof summarizeSnapshot>;

/// The compact price summary shown on store rows, cards and deal tiles.
export function summarizeSnapshot(snapshot: PriceSnapshot) {
  const onSale = snapshot.price < snapshot.basePrice;
  return {
    free: snapshot.isFree,
    amount: snapshot.isFree ? 0 : snapshot.price,
    /// Regular price in whole rupees; equals amount when not on sale.
    baseAmount: snapshot.isFree ? 0 : snapshot.basePrice,
    current: snapshot.isFree ? "Free" : formatPrice(snapshot.price, snapshot.currency),
    original: onSale ? formatPrice(snapshot.basePrice, snapshot.currency) : null,
    discountPercent: onSale
      ? Math.round((1 - snapshot.price / snapshot.basePrice) * 100)
      : 0,
    fetchedAt: snapshot.fetchedAt.toISOString(),
  };
}
