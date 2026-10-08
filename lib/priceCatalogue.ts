import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { STORE_SOURCES } from "@/lib/prices";

const IGDB_PAGE = 500;

/// Puts the most popular games that are sold on Steam or the PS Store under
/// daily price tracking, so their pages have prices before anyone opens
/// them. "Popular" is IGDB's total rating count (about 17k rated games have
/// a store listing; `limit` takes the top slice). Existing listings are left
/// untouched; new ones start outside the hot tier (lastViewedAt in the past),
/// so they're checked daily, not hourly.
export async function seedCatalogue(limit: number) {
  const headers = await getIgdbHeaders();
  const sources = STORE_SOURCES.map((s) => s.source).join(",");
  let games = 0;
  let created = 0;

  for (let offset = 0; offset < limit; offset += IGDB_PAGE) {
    const { data } = await axios.post<
      { id: number; slug: string; external_games?: { external_game_source: number; uid: string }[] }[]
    >(
      `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
      `fields id,slug,external_games.external_game_source,external_games.uid; where external_games.external_game_source = (${sources}) & total_rating_count > 0; sort total_rating_count desc; limit ${Math.min(IGDB_PAGE, limit - offset)}; offset ${offset};`,
      { headers }
    );
    if (data.length === 0) break;
    games += data.length;

    const rows = data.flatMap((game) =>
      STORE_SOURCES.flatMap(({ source, store }) => {
        const uid = game.external_games?.find((e) => e.external_game_source === source)?.uid;
        return uid
          ? [{ store, gameId: game.id, gameSlug: game.slug, externalId: uid, lastViewedAt: new Date(0) }]
          : [];
      })
    );
    const { count } = await prisma.priceListing.createMany({ data: rows, skipDuplicates: true });
    created += count;
    // IGDB allows 4 requests a second.
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return { games, created };
}
