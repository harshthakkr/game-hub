import { igdb, igdbNow } from "@/lib/igdb";

export type Maker = "playstation" | "xbox" | "nintendo" | "pc" | "sega" | "atari" | "other";

export type PlatformEntry = {
  id: number;
  name: string;
  slug: string;
  abbreviation: string | null;
  generation: number | null;
  count: number;
  maker: Maker;
};

export type FeaturedPlatform = PlatformEntry & {
  /// Short wordmark shown big on the tile ("PS5", "Switch 2").
  label: string;
  /// Covers of its most-rated recent games, for the tile's art strip.
  covers: string[];
};

export type PlatformDirectory = {
  featured: FeaturedPlatform[];
  makers: { maker: Maker; label: string; platforms: PlatformEntry[] }[];
  /// Everything below the maker sections' threshold, biggest first.
  other: PlatformEntry[];
};

/// Today's platforms, shown big at the top. IGDB slugs.
const FEATURED: { slug: string; label: string }[] = [
  { slug: "ps5", label: "PS5" },
  { slug: "series-x-s", label: "Xbox Series X|S" },
  { slug: "switch-2", label: "Switch 2" },
  { slug: "win", label: "PC" },
];

const MAKERS: { maker: Maker; label: string }[] = [
  { maker: "playstation", label: "PlayStation" },
  { maker: "xbox", label: "Xbox" },
  { maker: "nintendo", label: "Nintendo" },
  { maker: "pc", label: "PC, mobile & VR" },
  { maker: "sega", label: "Sega" },
  { maker: "atari", label: "Atari" },
];

/// Systems with fewer games than this go to "Other systems".
const MIN_GAMES = 50;
/// Art candidates per featured platform; four are shown.
const ART_CANDIDATES = 40;
const BATCH = 10;
const CONCURRENCY = 4;

/// IGDB's platform_family is missing for most platforms, so makers are
/// matched by name (and slug for the PC/mobile set).
function makerOf(p: { name: string; slug: string; family?: string }): Maker {
  const name = p.name.toLowerCase();
  if (p.family === "PlayStation" || /playstation|^ps ?vita|\bpsp\b/.test(name)) return "playstation";
  if (p.family === "Xbox" || name.includes("xbox")) return "xbox";
  if (
    p.family === "Nintendo" ||
    /nintendo|game boy|wii|switch|famicom|super nes|\bsnes\b|virtual boy|game & watch|pok[eé]mon mini|e-reader|satellaview|64dd/.test(name)
  )
    return "nintendo";
  if (p.family === "Sega" || /sega|dreamcast|genesis|mega drive|saturn|game gear|master system|32x/.test(name)) return "sega";
  if (p.family === "Atari" || /atari|jaguar|lynx/.test(name)) return "atari";
  if (/^(win|mac|linux|ios|android|browser|dos)$/.test(p.slug) || /meta quest|oculus|steamvr|windows mixed reality/.test(name))
    return "pc";
  return "other";
}

async function inBatches<T>(queries: string[]): Promise<T[]> {
  const batches: string[][] = [];
  for (let i = 0; i < queries.length; i += BATCH) batches.push(queries.slice(i, i + BATCH));
  const out: T[] = [];
  // A few at a time: IGDB allows 4 requests a second.
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = await Promise.all(
      batches
        .slice(i, i + CONCURRENCY)
        .map((b) => igdb<T[]>("/multiquery", b.join("\n"), { revalidate: 86400 }))
    );
    out.push(...chunk.flat());
  }
  return out;
}

/// The Platforms page: today's platforms with art, the rest grouped by maker
/// (newest generation first), and the long tail folded away. Game counts and
/// art come from IGDB multiquery, cached a day.
export async function getPlatformDirectory(): Promise<PlatformDirectory> {
  const raw = await igdb<
    { id: number; name: string; slug: string; abbreviation?: string; generation?: number; platform_family?: { name: string } }[]
  >("/platforms", "fields name,slug,abbreviation,generation,platform_family.name; limit 500;", { revalidate: 86400 });

  const counts = await inBatches<{ name: string; count?: number }>(
    raw.map((p) => `query games/count "count-${p.id}" { where platforms = (${p.id}); };`)
  );
  const countOf = new Map(counts.map((c) => [c.name, c.count ?? 0]));

  const platforms: PlatformEntry[] = raw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    abbreviation: p.abbreviation ?? null,
    generation: p.generation ?? null,
    count: countOf.get(`count-${p.id}`) ?? 0,
    maker: makerOf({ name: p.name, slug: p.slug, family: p.platform_family?.name }),
  }));
  const bySlug = new Map(platforms.map((p) => [p.slug, p]));

  const featuredBase = FEATURED.flatMap(({ slug, label }) => {
    const p = bySlug.get(slug);
    return p ? [{ ...p, label }] : [];
  });
  // The art should say *this* platform. Big releases are on all four, so
  // rank each platform's recent hits by how few of the featured platforms
  // they're on (exclusives first), then by popularity; never repeat a game
  // across tiles; the smallest catalogue picks first.
  const since = igdbNow(86400) - 4 * 365 * 86400;
  type ArtGame = { id: number; cover?: { url: string }; platforms?: number[] };
  const art = await inBatches<{ name: string; result?: ArtGame[] }>(
    featuredBase.map(
      (p) =>
        `query games "art-${p.id}" { fields cover.url,platforms; where platforms = (${p.id}) & cover != null & first_release_date >= ${since} & total_rating_count != null; sort total_rating_count desc; limit ${ART_CANDIDATES}; };`
    )
  );
  const artOf = new Map(art.map((a) => [a.name, a.result ?? []]));
  const featuredIds = new Set(featuredBase.map((p) => p.id));
  const reach = (g: ArtGame) => (g.platforms ?? []).filter((id) => featuredIds.has(id)).length;
  const used = new Set<number>();
  const coversOf = new Map<number, string[]>();
  for (const p of [...featuredBase].sort((a, b) => a.count - b.count)) {
    const ranked = (artOf.get(`art-${p.id}`) ?? [])
      .map((g, popularity) => ({ g, popularity }))
      .sort((a, b) => reach(a.g) - reach(b.g) || a.popularity - b.popularity)
      .map(({ g }) => g)
      .filter((g) => !used.has(g.id))
      .slice(0, 6);
    ranked.forEach((g) => used.add(g.id));
    coversOf.set(p.id, ranked.map((g) => `https:${g.cover!.url.replace("t_thumb", "t_cover_big")}`));
  }
  const featured = featuredBase.map((p) => ({ ...p, covers: coversOf.get(p.id) ?? [] }));

  const newestFirst = (a: PlatformEntry, b: PlatformEntry) =>
    (b.generation ?? 0) - (a.generation ?? 0) || b.count - a.count;
  const makers = MAKERS.map(({ maker, label }) => ({
    maker,
    label,
    platforms: platforms.filter((p) => p.maker === maker && p.count >= MIN_GAMES).sort(newestFirst),
  })).filter((m) => m.platforms.length > 0);

  const shown = new Set(makers.flatMap((m) => m.platforms.map((p) => p.id)));
  const other = platforms.filter((p) => !shown.has(p.id) && p.count > 0).sort((a, b) => b.count - a.count);

  return { featured, makers, other };
}
