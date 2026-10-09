import { prisma } from "@/lib/prisma";
import { fetchPsStorePrice, psStoreConceptUrl } from "@/lib/psStore";
import { fetchSteamPrice, fetchSteamPrices, STEAM_BATCH_SIZE, steamAppUrl, type StorePrice } from "@/lib/steam";
import type { PriceListing, PriceSnapshot, PriceStore } from "@/app/generated/prisma";

/// Two refresh tiers (the sweep runs every 3 hours):
/// - hot: on someone's wishlist/library, or opened in the last 14 days —
///   re-checked every run, i.e. every 3 hours (a page view past the TTL
///   also refreshes it);
/// - catalogue: every other tracked listing (incl. the seeded popular set) —
///   re-checked daily.
// Just under the 3-hour schedule, so a listing checked last run is due again
// this run despite GitHub's few minutes of scheduling jitter.
export const PRICE_TTL_MS = (2 * 60 + 50) * 60 * 1000;
const CATALOGUE_TTL_MS = 23 * 60 * 60 * 1000;
const HOT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
/// Snapshots are stored only when a price changes, so history is small; older
/// rows are pruned, but never a listing's latest (that's its current price).
const RETENTION_MS = 180 * 24 * 60 * 60 * 1000;

export const isStale = (fetchedAt: Date | null | undefined) =>
  !fetchedAt || Date.now() - fetchedAt.getTime() > PRICE_TTL_MS;

// IGDB's external_games.external_game_source enum: 1 identifies a Steam
// store listing, with the Steam app id carried in `uid`; 36 is a PlayStation
// Store listing, whose `uid` is a region-independent concept id. PS first:
// that's the order stores are shown in.
export const STORE_SOURCES: { source: number; store: PriceStore }[] = [
  { source: 36, store: "PLAYSTATION" },
  { source: 1, store: "STEAM" },
];

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

/// A listing with its latest snapshot, or null if the game isn't tracked on
/// that store yet. Read-only, so the game page can be cached.
export function findListing(gameId: number, store: PriceStore) {
  return prisma.priceListing.findUnique({
    where: { gameId_store: { gameId, store } },
    include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
  });
}

/// Puts the game's listings in the hot tier: called when someone opens the
/// page (a beacon from the browser, so page renders stay cacheable).
export function markViewed(gameSlug: string) {
  return prisma.priceListing.updateMany({ where: { gameSlug }, data: { lastViewedAt: new Date() } });
}

/// Registers (or bumps) a store listing for a game the user is looking at,
/// returning it with its latest snapshot.
export function trackListing(
  game: { id: number; slug: string },
  store: PriceStore,
  externalId: string
) {
  return prisma.priceListing.upsert({
    where: { gameId_store: { gameId: game.id, store } },
    create: { store, gameId: game.id, gameSlug: game.slug, externalId },
    update: { lastViewedAt: new Date(), gameSlug: game.slug, externalId },
    include: { snapshots: { orderBy: { fetchedAt: "desc" }, take: 1 } },
  });
}

export function latestSnapshot(listingId: string) {
  return prisma.priceSnapshot.findFirst({
    where: { listingId },
    orderBy: { fetchedAt: "desc" },
  });
}

/// Records one check of a listing. A snapshot is written only when the price
/// differs from the latest one (prices hold between changes, which is how the
/// chart draws them); every check still stamps lastFetchedAt.
async function recordPrice(
  listingId: string,
  price: StorePrice | null,
  missing: string,
  now: Date
): Promise<PriceSnapshot | null> {
  if (!price) {
    await prisma.priceListing.update({
      where: { id: listingId },
      data: { lastFetchedAt: now, lastError: missing },
    });
    return null;
  }
  const latest = await latestSnapshot(listingId);
  const unchanged =
    latest &&
    latest.price === price.price &&
    latest.basePrice === price.basePrice &&
    latest.isFree === price.isFree &&
    latest.currency === price.currency &&
    (latest.saleEndsAt?.getTime() ?? null) === (price.saleEndsAt?.getTime() ?? null);
  const listingUpdate = prisma.priceListing.update({
    where: { id: listingId },
    data: {
      lastFetchedAt: now,
      lastError: null,
      // Steam's batch endpoint has no names; keep the one we already have.
      ...(price.productName ? { productName: price.productName } : {}),
    },
  });
  if (unchanged) {
    await listingUpdate;
    return latest;
  }
  const [snapshot] = await prisma.$transaction([
    prisma.priceSnapshot.create({
      data: {
        listingId,
        fetchedAt: now,
        currency: price.currency,
        basePrice: price.basePrice,
        price: price.price,
        isFree: price.isFree,
        saleEndsAt: price.saleEndsAt,
      },
    }),
    listingUpdate,
  ]);
  return snapshot;
}

async function recordError(listingId: string, error: unknown, now: Date) {
  await prisma.priceListing
    .update({
      where: { id: listingId },
      data: { lastFetchedAt: now, lastError: (error as Error).message.slice(0, 500) },
    })
    .catch(() => {});
}

/// Fetches one listing from its store and records the result. Failures are
/// stored on the listing rather than thrown, so one broken game never stalls
/// a sweep.
export async function refreshListing(
  listing: Pick<PriceListing, "id" | "externalId" | "store">
): Promise<PriceSnapshot | null> {
  const now = new Date();
  const store = STORES[listing.store];
  try {
    return await recordPrice(listing.id, await store.fetch(listing.externalId), store.missing, now);
  } catch (error) {
    await recordError(listing.id, error, now);
    return null;
  }
}

type DueListing = Pick<PriceListing, "id" | "externalId" | "store">;

/// Listings due a check, hot tier first, each oldest first.
async function dueListings(now: number) {
  const collected = await prisma.collectionItem.findMany({
    distinct: ["gameId"],
    select: { gameId: true },
  });
  const hot = {
    OR: [
      { lastViewedAt: { gte: new Date(now - HOT_WINDOW_MS) } },
      { gameId: { in: collected.map((c) => c.gameId) } },
    ],
  };
  const staleFor = (ttl: number) => ({
    OR: [{ lastFetchedAt: null }, { lastFetchedAt: { lt: new Date(now - ttl) } }],
  });
  const select = { id: true, externalId: true, store: true } as const;
  const orderBy = { lastFetchedAt: { sort: "asc", nulls: "first" } } as const;
  const [hotDue, catalogueDue] = await Promise.all([
    prisma.priceListing.findMany({ where: { AND: [hot, staleFor(PRICE_TTL_MS)] }, orderBy, select }),
    prisma.priceListing.findMany({
      where: { AND: [{ NOT: hot }, staleFor(CATALOGUE_TTL_MS)] },
      orderBy,
      select,
    }),
  ]);
  return { hot: hotDue.length, due: [...hotDue, ...catalogueDue] };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/// Refreshes every due listing until `budgetMs` is spent; leftovers are first
/// in line next run. Steam goes in batches of 100 (one request each); the PS
/// Store has no bulk API, so it's one page per game, kept gentle with a small
/// worker pool and a pause between pages.
export async function refreshDueListings(
  budgetMs: number,
  { psConcurrency = 2, psDelayMs = 400 }: { psConcurrency?: number; psDelayMs?: number } = {}
) {
  const startedAt = Date.now();
  const inBudget = () => Date.now() - startedAt < budgetMs;
  const { hot, due } = await dueListings(startedAt);
  let refreshed = 0;
  let failed = 0;

  const steam = due.filter((l) => l.store === "STEAM");
  const ps = due.filter((l) => l.store === "PLAYSTATION");

  for (let i = 0; i < steam.length && inBudget(); i += STEAM_BATCH_SIZE) {
    const batch = steam.slice(i, i + STEAM_BATCH_SIZE);
    const now = new Date();
    try {
      const prices = await fetchSteamPrices(batch.map((l) => l.externalId));
      for (const listing of batch) {
        const price = prices.get(listing.externalId);
        // Free or not sold in India: only the single lookup can tell which.
        const ok = price
          ? await recordPrice(listing.id, price, STORES.STEAM.missing, now)
          : await refreshListing(listing);
        if (ok) refreshed++;
        else failed++;
      }
    } catch (error) {
      for (const listing of batch) await recordError(listing.id, error, now);
      failed += batch.length;
    }
    await sleep(1000);
  }

  const queue: DueListing[] = [...ps];
  const worker = async () => {
    while (queue.length && inBudget()) {
      const listing = queue.shift()!;
      if (await refreshListing(listing)) refreshed++;
      else failed++;
      await sleep(psDelayMs);
    }
  };
  await Promise.all(Array.from({ length: psConcurrency }, worker));

  // Old snapshots go, except each listing's newest (its current price).
  const pruned = await prisma.$executeRaw`
    DELETE FROM "PriceSnapshot" s
    WHERE s."fetchedAt" < ${new Date(startedAt - RETENTION_MS)}
      AND EXISTS (
        SELECT 1 FROM "PriceSnapshot" n
        WHERE n."listingId" = s."listingId" AND n."fetchedAt" > s."fetchedAt"
      )`;

  return {
    due: due.length,
    hot,
    refreshed,
    failed,
    skipped: due.length - refreshed - failed,
    pruned,
    seconds: Math.round((Date.now() - startedAt) / 1000),
  };
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
