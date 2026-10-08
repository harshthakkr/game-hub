// Catalogue filters, shared by the /api/games query builder and the filter UI.
// Values are URL-friendly keys; ids are IGDB's.

export type FilterOption = { value: string; label: string };

export const GENRES = [
  { value: "adventure", label: "Adventure", id: 31 },
  { value: "rpg", label: "RPG", id: 12 },
  { value: "shooter", label: "Shooter", id: 5 },
  { value: "indie", label: "Indie", id: 32 },
  { value: "platform", label: "Platformer", id: 8 },
  { value: "strategy", label: "Strategy", id: 15 },
  { value: "puzzle", label: "Puzzle", id: 9 },
  { value: "fighting", label: "Fighting", id: 4 },
  { value: "racing", label: "Racing", id: 10 },
  { value: "sport", label: "Sport", id: 14 },
] as const;

export const PLATFORMS = [
  { value: "ps5", label: "PS5", id: 167 },
  { value: "pc", label: "PC", id: 6 },
  { value: "xbox", label: "Xbox Series", id: 169 },
  { value: "switch2", label: "Switch 2", id: 508 },
  { value: "switch", label: "Switch", id: 130 },
  { value: "ps4", label: "PS4", id: 48 },
] as const;

const year = (y: number) => Math.floor(Date.UTC(y, 0, 1) / 1000);

/// Release-year buckets as [from, to) unix-second ranges.
export const YEARS = [
  { value: "2026", label: "2026", from: year(2026), to: year(2027) },
  { value: "2025", label: "2025", from: year(2025), to: year(2026) },
  { value: "2020s", label: "2020–24", from: year(2020), to: year(2025) },
  { value: "2010s", label: "2010s", from: year(2010), to: year(2020) },
  { value: "older", label: "Older", from: 0, to: year(2010) },
] as const;

export const RATINGS = [
  { value: "90", label: "90+", min: 90 },
  { value: "80", label: "80+", min: 80 },
  { value: "70", label: "70+", min: 70 },
] as const;

export const SORTS = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "date", label: "Newest" },
  { value: "az", label: "A–Z" },
] as const;

export type CatalogSort = (typeof SORTS)[number]["value"];
/// What the catalogue opens on (and what a URL without ?sort= means).
export const DEFAULT_SORT: CatalogSort = "popularity";

export type CatalogFilters = {
  genre?: string;
  platform?: string;
  year?: string;
  rating?: string;
  /// "1": only games currently discounted on a store we track.
  sale?: string;
  sort?: CatalogSort;
};

/// IGDB `where` and `sort` clauses for a filter set. Unknown values are
/// ignored. `ids` restricts the query to those games (the on-sale set).
export function igdbCatalogQuery(filters: CatalogFilters, ids?: number[]) {
  const where = ["cover != null"];
  if (ids) where.push(`id = (${ids.join(",")})`);
  const genre = GENRES.find((g) => g.value === filters.genre);
  const platform = PLATFORMS.find((p) => p.value === filters.platform);
  const years = YEARS.find((y) => y.value === filters.year);
  const rating = RATINGS.find((r) => r.value === filters.rating);
  const sort = SORTS.find((s) => s.value === filters.sort)?.value ?? DEFAULT_SORT;

  if (genre) where.push(`genres = (${genre.id})`);
  if (platform) where.push(`platforms = (${platform.id})`);
  if (years) where.push(`first_release_date >= ${years.from} & first_release_date < ${years.to}`);
  if (rating) where.push(`aggregated_rating >= ${rating.min}`);
  // Rating order is meaningless for unrated games; newest-first should not
  // surface far-future placeholders.
  if (sort === "rating" && !rating) where.push("aggregated_rating != null");
  if (sort === "date") where.push(`first_release_date <= ${Math.floor(Date.now() / 1000)}`);

  const order = {
    rating: "aggregated_rating desc",
    popularity: "hypes desc",
    date: "first_release_date desc",
    az: "name asc",
  }[sort];

  return { where: where.join(" & "), sort: order };
}
