import { igdb } from "@/lib/igdb";
import { coverAccent } from "@/lib/accent";

export type GenreTile = {
  id: number;
  name: string;
  slug: string;
  /// Covers of the genre's most-rated games (up to 3), lead first.
  covers: string[];
  /// Hue of the lead cover (lib/accent), for the tile's tint.
  accent: string | null;
  count: number;
};

type Candidate = { id: number; cover?: { url: string }; collections?: number[] };
type MultiResult = { name: string; result?: Candidate[]; count?: number };

/// What makes two picks "the same" on the page: their series (GTA III, Vice
/// City and V would read as one game three times), else the cover image
/// (re-releases often share one).
const identity = (game: Candidate) =>
  game.collections?.length ? `series:${game.collections[0]}` : `cover:${game.cover!.url}`;

/// Candidates fetched per genre; the three shown are picked from these.
const CANDIDATES = 30;

/// IGDB's multiquery runs up to 10 queries per request.
const BATCH = 10;

/// Genre tiles built from real game art: three of each genre's most-rated
/// games (by number of ratings) and its total game count. The best-known
/// games carry many genre tags (GTA V is Adventure, Arcade, Shooter, Racing…),
/// so covers are assigned without repeating a game or a series anywhere on
/// the page: smallest genres pick first (they
/// have the fewest candidates), big ones fill in from deeper in their lists.
/// Two queries per genre,
/// sent through IGDB's multiquery in batches and cached a day via `igdb()`,
/// so the whole page costs a handful of requests a day. Biggest genres first.
export async function getGenreTiles(): Promise<GenreTile[]> {
  const genres = await igdb<{ id: number; name: string; slug: string }[]>(
    "/genres",
    "fields name,slug; limit 50;",
    { revalidate: 86400 }
  );

  const queries = genres.flatMap((g) => [
    `query games "covers-${g.id}" { fields id,cover.url,collections; where genres = (${g.id}) & cover != null & total_rating_count != null; sort total_rating_count desc; limit ${CANDIDATES}; };`,
    `query games/count "count-${g.id}" { where genres = (${g.id}); };`,
  ]);
  const results: MultiResult[] = [];
  for (let i = 0; i < queries.length; i += BATCH) {
    results.push(
      ...(await igdb<MultiResult[]>("/multiquery", queries.slice(i, i + BATCH).join("\n"), {
        revalidate: 86400,
      }))
    );
  }
  const byName = new Map(results.map((r) => [r.name, r]));

  const count = (id: number) => byName.get(`count-${id}`)?.count ?? 0;
  const used = new Set<string>();
  const picks = new Map<number, string[]>();
  for (const g of [...genres].sort((a, b) => count(a.id) - count(b.id))) {
    const candidates = (byName.get(`covers-${g.id}`)?.result ?? []).filter((game) => game.cover?.url);
    // Unused games first; if a tiny genre runs out, repeats beat an empty fan.
    const chosen: Candidate[] = [];
    const take = (game: Candidate) => {
      chosen.push(game);
      used.add(identity(game));
    };
    for (const game of candidates) if (chosen.length < 3 && !used.has(identity(game))) take(game);
    // A tiny genre that runs out: a repeat beats an empty fan.
    for (const game of candidates) if (chosen.length < 3 && !chosen.includes(game)) take(game);
    picks.set(
      g.id,
      chosen.map((game) => `https:${game.cover!.url.replace("t_thumb", "t_cover_big")}`)
    );
  }

  const tiles = await Promise.all(
    genres.map(async (g) => {
      const covers = picks.get(g.id) ?? [];
      return {
        ...g,
        covers,
        accent: covers[0] ? await coverAccent(covers[0]) : null,
        count: count(g.id),
      };
    })
  );
  return tiles.sort((a, b) => b.count - a.count);
}
