import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { after, NextRequest, NextResponse } from "next/server";
import { psStoreConceptUrl } from "@/lib/psStore";
import {
  isStale,
  latestSnapshot,
  refreshListing,
  summarizeSnapshot,
  trackPsListing,
} from "@/lib/prices";

// IGDB's external_games.external_game_source enum: 1 identifies a Steam
// store listing, with the Steam app id carried in `uid`; 36 is a PlayStation
// Store listing, whose `uid` is a region-independent concept id.
const STEAM_SOURCE = 1;
const PS_STORE_SOURCE = 36;
const FIRST_FETCH_TIMEOUT_MS = 6000;

async function fetchSteamPrice(appId: string) {
  try {
    const { data } = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=in&filters=price_overview,is_free`,
      { timeout: 4000 }
    );
    const entry = data?.[appId];
    if (!entry?.success) return null;
    const info = entry.data;
    if (info?.is_free) {
      return { free: true, current: "Free", original: null, discountPercent: 0 };
    }
    const overview = info?.price_overview;
    if (!overview) return null;
    return {
      free: false,
      current: overview.final_formatted,
      original:
        overview.discount_percent > 0 ? overview.initial_formatted : null,
      discountPercent: overview.discount_percent || 0,
    };
  } catch {
    // Steam's API is unauthenticated and occasionally flaky/rate-limited —
    // pricing is a nice-to-have, so fail quietly rather than break the page.
    return null;
  }
}

/// Tracks the game's PS Store listing and returns its latest known price.
/// A game seen for the first time is scraped inline (bounded by a timeout) so
/// the button isn't empty; after that, stale prices are served immediately and
/// refreshed in the background.
async function getPsStorePrice(game: { id: number; slug: string }, conceptId: string) {
  try {
    const listing = await trackPsListing(game, conceptId);
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
    `fields id,name,summary,videos.video_id,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,genres.name,aggregated_rating,first_release_date,screenshots.url,screenshots.height,screenshots.width,artworks.url,artworks.height,artworks.width,cover.url,release_dates.human,platforms.name,external_games.external_game_source,external_games.uid,similar_games.id,similar_games.name,similar_games.cover.url,similar_games.slug,similar_games.aggregated_rating,similar_games.first_release_date,similar_games.genres.name,similar_games.hypes; where slug = "${slug}";`,
    { headers }
  );
  const res = gameRes.data[0];
  if (!res) return NextResponse.json(res);

  const externalGames = res.external_games as
    | { external_game_source: number; uid: string }[]
    | undefined;
  const steamAppId = externalGames?.find(
    (g) => g.external_game_source === STEAM_SOURCE
  )?.uid;
  const psConceptId = externalGames?.find(
    (g) => g.external_game_source === PS_STORE_SOURCE
  )?.uid;

  const [steamPrice, psPrice] = await Promise.all([
    steamAppId ? fetchSteamPrice(steamAppId) : null,
    psConceptId ? getPsStorePrice({ id: res.id, slug }, psConceptId) : null,
  ]);

  return NextResponse.json({
    ...res,
    steamAppId: steamAppId || null,
    steamPrice,
    psStore: psConceptId
      ? { conceptId: psConceptId, url: psStoreConceptUrl(psConceptId), price: psPrice }
      : null,
  });
};
