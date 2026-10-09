import { igdb } from "@/lib/igdb";
import { coverAccent } from "@/lib/accent";

export type StudioGame = { name: string; slug: string; cover: string | null };

export type Studio = {
  id: number;
  name: string;
  slug: string;
  /// "Japan", "United States"… (null if IGDB doesn't say).
  country: string | null;
  founded: number | null;
  /// Its most-rated games among the ones scanned, best first.
  games: StudioGame[];
  /// Total player ratings across those games: the ranking score.
  ratings: number;
};

export type RankedStudio = Studio & { rank: number; accent: string | null };

/// IGDB company countries are ISO 3166-1 numeric codes; these cover nearly
/// every studio in the leaderboard. Names come from Intl, so they're proper.
const ISO_NUMERIC: Record<number, string> = {
  840: "US", 392: "JP", 124: "CA", 826: "GB", 250: "FR", 616: "PL", 752: "SE", 276: "DE",
  410: "KR", 156: "CN", 528: "NL", 246: "FI", 724: "ES", 380: "IT", 36: "AU", 203: "CZ",
  804: "UA", 643: "RU", 208: "DK", 578: "NO", 56: "BE", 756: "CH", 40: "AT", 76: "BR",
  356: "IN", 554: "NZ", 348: "HU", 642: "RO", 688: "RS", 703: "SK", 372: "IE", 158: "TW",
  344: "HK", 702: "SG", 376: "IL", 32: "AR", 484: "MX", 620: "PT", 300: "GR", 792: "TR",
};
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryName(code?: number) {
  const alpha2 = code ? ISO_NUMERIC[code] : undefined;
  return alpha2 ? (regionNames.of(alpha2) ?? null) : null;
}

/// IGDB's full legal-ish names for a few giants are too long for a row.
const SHORT_NAMES: Record<string, string> = {
  "Nintendo Entertainment Analysis & Development": "Nintendo EAD",
  "Nintendo Entertainment Planning & Development": "Nintendo EPD",
  "EA Digital Illusions CE": "DICE",
  "Capcom Development Division 1": "Capcom Dev 1",
  "Capcom Development Division 2": "Capcom Dev 2",
};

type ScannedGame = {
  name: string;
  slug: string;
  total_rating_count?: number;
  cover?: { url: string };
  involved_companies?: {
    developer?: boolean;
    company?: { id: number; name: string; slug: string; country?: number; start_date?: number };
  }[];
};

const SCAN_PAGES = [0, 500];
const LEADERBOARD = 50;

const cover = (url?: string) => (url ? `https:${url.replace("t_thumb", "t_cover_big")}` : null);

/// The studios behind the games people play most: IGDB's 1,000 most-rated
/// games, each credited to its developers, studios ranked by the total
/// ratings their games collected. Two IGDB requests, cached a day. The top 3
/// carry a tint from their best-known cover (as genre tiles do).
export async function getStudioLeaderboard(): Promise<RankedStudio[]> {
  const pages = await Promise.all(
    SCAN_PAGES.map((offset) =>
      igdb<ScannedGame[]>(
        "/games",
        `fields name,slug,total_rating_count,cover.url,involved_companies.developer,involved_companies.company.name,involved_companies.company.slug,involved_companies.company.country,involved_companies.company.start_date; where total_rating_count != null & cover != null; sort total_rating_count desc; limit 500; offset ${offset};`,
        { revalidate: 86400 }
      )
    )
  );

  const studios = new Map<number, Studio>();
  for (const game of pages.flat()) {
    for (const credit of game.involved_companies ?? []) {
      const c = credit.company;
      if (!credit.developer || !c) continue;
      const studio =
        studios.get(c.id) ??
        studios
          .set(c.id, {
            id: c.id,
            name: SHORT_NAMES[c.name] ?? c.name,
            slug: c.slug,
            country: countryName(c.country),
            founded: c.start_date ? new Date(c.start_date * 1000).getUTCFullYear() : null,
            games: [],
            ratings: 0,
          })
          .get(c.id)!;
      // IGDB sometimes credits a company twice on one game: count it once.
      if (studio.games.some((g) => g.slug === game.slug)) continue;
      studio.games.push({ name: game.name, slug: game.slug, cover: cover(game.cover?.url) });
      studio.ratings += game.total_rating_count ?? 0;
    }
  }

  // Games arrive most-rated first, so each studio's list is already ranked.
  // A parent and its studio are often both credited for the same games
  // (BioWare and BioWare Edmonton): if two of a studio's top three already
  // belong to one higher-ranked studio, it's the same work, so keep one.
  const ranked: Studio[] = [];
  for (const studio of [...studios.values()].sort((a, b) => b.ratings - a.ratings)) {
    const top = studio.games.slice(0, 3).map((g) => g.slug);
    const duplicate = ranked.some((r) => {
      const theirs = new Set(r.games.slice(0, 3).map((g) => g.slug));
      return top.filter((slug) => theirs.has(slug)).length >= 2;
    });
    if (!duplicate) ranked.push(studio);
    if (ranked.length === LEADERBOARD) break;
  }
  return Promise.all(
    ranked.map(async (s, i) => ({
      ...s,
      games: s.games.slice(0, 4),
      rank: i + 1,
      accent: i < 3 && s.games[0]?.cover ? await coverAccent(s.games[0].cover) : null,
    }))
  );
}

export type StudioMatch = {
  id: number;
  name: string;
  slug: string;
  country: string | null;
  founded: number | null;
  /// Leaderboard place, if it has one.
  rank: number | null;
};

type CompanyRow = { id: number; name: string; slug: string; country?: number; start_date?: number };

/// Any studio by name, for the search box. IGDB companies can't be
/// full-text searched, so results are ranked here: leaderboard studios first
/// (by rank), then names starting with the term, then names containing it.
/// Otherwise "from" finds "Afromancer" before FromSoftware.
export async function searchStudios(term: string): Promise<StudioMatch[]> {
  const safe = term.replace(/["\\*]/g, " ").trim();
  if (safe.length < 2) return [];
  const fields = "fields name,slug,country,start_date;";
  const [prefix, contains, board] = await Promise.all([
    igdb<CompanyRow[]>("/companies", `${fields} where name ~ "${safe}"* & developed != null; limit 30;`),
    igdb<CompanyRow[]>("/companies", `${fields} where name ~ *"${safe}"* & developed != null; limit 50;`),
    getStudioLeaderboard(),
  ]);
  const rankOf = new Map(board.map((s) => [s.id, s.rank]));
  const seen = new Set<number>();
  const merged: StudioMatch[] = [];
  // Leaderboard studios match on their display name too ("DICE" is "EA
  // Digital Illusions CE" in IGDB), and IGDB's capped lists can miss them
  // ("rock" has more prefix matches than fit before Rockstar North).
  const needle = safe.toLowerCase();
  for (const s of board) {
    if (!s.name.toLowerCase().includes(needle)) continue;
    seen.add(s.id);
    merged.push({ id: s.id, name: s.name, slug: s.slug, country: s.country, founded: s.founded, rank: s.rank });
  }
  for (const c of [...prefix, ...contains]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push({
      id: c.id,
      name: SHORT_NAMES[c.name] ?? c.name,
      slug: c.slug,
      country: countryName(c.country),
      founded: c.start_date ? new Date(c.start_date * 1000).getUTCFullYear() : null,
      rank: rankOf.get(c.id) ?? null,
    });
  }
  const prefixIds = new Set(prefix.map((c) => c.id));
  const tier = (m: StudioMatch) => (m.rank !== null ? 0 : prefixIds.has(m.id) ? 1 : 2);
  return merged
    .sort((a, b) => tier(a) - tier(b) || (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name))
    .slice(0, 20);
}
