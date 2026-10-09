"use client";

import { useMemo, useState } from "react";
import { GameCardProps } from "@/utils/types";
import { ChipGroup } from "@/components/ui";
import { DEFAULT_SORT, SORTS, type CatalogSort } from "@/utils/catalog";

/// One sort vocabulary for every list of games: the catalogue's
/// (Popularity · Rating · Newest · A–Z), Popularity by default.
export type GameSort = CatalogSort;

/// In-browser sort, for lists that are loaded whole (a developer's games).
/// Paginated lists sort on the server instead (see utils/catalog sortClause),
/// so new pages append in order. Same orders as the server.
export function sortGames(games: GameCardProps[], sort: GameSort) {
  return [...games].sort((a, b) => {
    if (sort === "rating") return (b.aggregated_rating || 0) - (a.aggregated_rating || 0);
    if (sort === "date") return (b.first_release_date || 0) - (a.first_release_date || 0);
    if (sort === "popularity") return (b.hypes || 0) - (a.hypes || 0);
    return a.name.localeCompare(b.name);
  });
}

/// Sort for a fully loaded list of games (drops coverless entries).
export function useGameFilterSort(games: GameCardProps[]) {
  const [sort, setSort] = useState<GameSort>(DEFAULT_SORT);
  const covered = useMemo(() => games.filter((g) => g.cover), [games]);
  const visible = useMemo(() => sortGames(covered, sort), [covered, sort]);
  return { covered, sort, setSort, visible };
}

export function GameFilterBar({
  sort,
  setSort,
}: {
  sort: GameSort;
  setSort: (s: GameSort) => void;
}) {
  return <ChipGroup label="Sort by" variant="segmented" options={SORTS} value={sort} onValueChange={setSort} />;
}
