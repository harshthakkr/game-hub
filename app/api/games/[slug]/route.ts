import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { after, NextRequest, NextResponse } from "next/server";
import {
  STORES,
  isStale,
  latestSnapshot,
  refreshListing,
  summarizeSnapshot,
  trackListing,
} from "@/lib/prices";
import type { PriceStore } from "@/app/generated/prisma";

// IGDB's external_games.external_game_source enum: 1 identifies a Steam
// store listing, with the Steam app id carried in `uid`; 36 is a PlayStation
// Store listing, whose `uid` is a region-independent concept id.
const SOURCES: { source: number; store: PriceStore }[] = [
  { source: 36, store: "PLAYSTATION" },
  { source: 1, store: "STEAM" },
];
const FIRST_FETCH_TIMEOUT_MS = 6000;

/// Tracks the game's listing on one store and returns its latest known price.
/// A game seen for the first time is fetched inline (bounded by a timeout) so
/// the page isn't empty; after that, stale prices are served immediately and
/// refreshed in the background.
async function getStorePrice(
  game: { id: number; slug: string },
  store: PriceStore,
  externalId: string
) {
  try {
    const listing = await trackListing(game, store, externalId);
    let snapshot = await latestSnapshot(listing.id);
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

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const headers = await getIgdbHeaders();
  const { slug } = await params;

  const gameRes = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
    `fields id,name,summary,hypes,videos.video_id,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,genres.name,aggregated_rating,first_release_date,screenshots.url,screenshots.height,screenshots.width,artworks.url,artworks.height,artworks.width,cover.url,release_dates.human,platforms.name,external_games.external_game_source,external_games.uid,similar_games.id,similar_games.name,similar_games.cover.url,similar_games.slug,similar_games.aggregated_rating,similar_games.first_release_date,similar_games.genres.name,similar_games.hypes; where slug = "${slug}";`,
    { headers }
  );
  const res = gameRes.data[0];
  if (!res) return NextResponse.json(res);

  const externalGames = (res.external_games ?? []) as {
    external_game_source: number;
    uid: string;
  }[];
  const listed = SOURCES.flatMap(({ source, store }) => {
    const externalId = externalGames.find((g) => g.external_game_source === source)?.uid;
    return externalId ? [{ store, externalId }] : [];
  });

  // Every store the game is listed on, PS Store first, each with its tracked
  // price (null while the first fetch is pending or the store has no price).
  const stores = await Promise.all(
    listed.map(async ({ store, externalId }) => ({
      store,
      label: STORES[store].label,
      url: STORES[store].url(externalId),
      price: await getStorePrice({ id: res.id, slug }, store, externalId),
    }))
  );

  return NextResponse.json({ ...res, stores });
};
