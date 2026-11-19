import { cache } from "react";
import { after } from "next/server";
import { igdb } from "@/lib/igdb";
import { extractAccent } from "@/lib/accent";
import {
  STORES,
  findListing,
  isStale,
  refreshListing,
  summarizeSnapshot,
  STORE_SOURCES,
  trackListing,
} from "@/lib/prices";
import type { PriceSnapshot, PriceStore } from "@/app/generated/prisma";
import type { GamePageProps, StoreListing } from "@/utils/types";

const FIRST_FETCH_TIMEOUT_MS = 6000;

/// The game's latest known price on one store. Read-only for games already
/// tracked (the page is cached; views are recorded by a separate beacon). A
/// game seen for the first time is registered and fetched inline (bounded by
/// a timeout) so the page isn't empty; stale prices are served immediately
/// and refreshed in the background.
async function getStorePrice(
  game: { id: number; slug: string },
  store: PriceStore,
  externalId: string
) {
  try {
    const listing =
      (await findListing(game.id, store)) ?? (await trackListing(game, store, externalId));
    let snapshot: PriceSnapshot | null = listing.snapshots[0] ?? null;
    if (!snapshot && !listing.lastFetchedAt) {
      snapshot = await Promise.race([
        refreshListing(listing),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), FIRST_FETCH_TIMEOUT_MS)),
      ]);
    } else if (isStale(listing.lastFetchedAt)) {
      after(() => refreshListing(listing));
    }
    return snapshot ? summarizeSnapshot(snapshot) : null;
  } catch {
    // Price tracking is a nice-to-have; a database hiccup shouldn't break the page.
    return null;
  }
}

/// Game page data from IGDB, plus every store the game is listed on (prices
/// left null). No database access: the page is rendered for crawlers too, and
/// each render would wake the database. Prices are filled in by
/// `getStorePrices`, which the page calls from the browser and which skips
/// bots. `cache` dedupes calls within one request.
export const getGame = cache(async (slug: string): Promise<GamePageProps | null> => {
  // Slugs are [a-z0-9-]; anything else could break out of the query string.
  const safe = slug.replace(/[^a-z0-9-]/gi, "");
  const found = await igdb<GamePageProps[]>(
    "/games",
    `fields id,name,summary,hypes,videos.video_id,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,genres.name,aggregated_rating,first_release_date,screenshots.url,screenshots.height,screenshots.width,artworks.url,artworks.height,artworks.width,cover.url,release_dates.human,platforms.name,external_games.external_game_source,external_games.uid,similar_games.id,similar_games.name,similar_games.cover.url,similar_games.slug,similar_games.aggregated_rating,similar_games.first_release_date,similar_games.genres.name,similar_games.hypes; where slug = "${safe}";`,
    // Not data-cached: the game page is itself the cache (ISR), and with 300k+
    // games a data-cache entry per game is a second billed write per page.
    { cache: false }
  );
  const res = found[0] as GamePageProps & { external_games?: { external_game_source: number; uid: string }[] };
  if (!res) return null;

  const externalGames = (res.external_games ?? []) as {
    external_game_source: number;
    uid: string;
  }[];
  const listed = STORE_SOURCES.flatMap(({ source, store }) => {
    const externalId = externalGames.find((g) => g.external_game_source === source)?.uid;
    return externalId ? [{ store, externalId }] : [];
  });

  // Every store the game is listed on, PS Store first, each with its tracked
  // price (null while the first fetch is pending or the store has no price).
  const stores = listed.map(({ store, externalId }) => ({
    store,
    label: STORES[store].label,
    url: STORES[store].url(externalId),
    price: null,
  }));
  const accent = res.cover?.url ? await extractAccent(res.cover.url) : null;

  return { ...res, slug: safe, stores, accent } as GamePageProps;
});

/// Every store the game is listed on, with its tracked price (null while the
/// first fetch is pending or the store has no price). Reads the database.
export async function getStorePrices(game: GamePageProps): Promise<StoreListing[]> {
  const externalGames = ((game as { external_games?: { external_game_source: number; uid: string }[] })
    .external_games ?? []);
  const ref = { id: game.id as number, slug: (game as { slug?: string }).slug ?? "" };
  return Promise.all(
    game.stores.map(async (listing) => {
      const source = STORE_SOURCES.find((s) => s.store === listing.store)!.source;
      const externalId = externalGames.find((g) => g.external_game_source === source)!.uid;
      return { ...listing, price: await getStorePrice(ref, listing.store, externalId) };
    })
  );
}

/// `getGame` with prices filled in, for the OG image and /api/games/[slug].
export const getGameWithPrices = cache(async (slug: string): Promise<GamePageProps | null> => {
  const game = await getGame(slug);
  return game && { ...game, stores: await getStorePrices(game) };
});
