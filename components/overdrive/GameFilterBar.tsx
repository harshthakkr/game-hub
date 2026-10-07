"use client";

import { useMemo, useState } from "react";
import { GameCardProps } from "@/utils/types";
import { Select, type SelectOption } from "@/components/ui";

export type GameSort = "rating" | "date" | "popularity" | "az";

export const GAME_SORTS: readonly SelectOption<GameSort>[] = [
  { value: "rating", label: "Rating" },
  { value: "date", label: "Release date" },
  { value: "popularity", label: "Popularity" },
  { value: "az", label: "A – Z" },
];

export function sortGames(games: GameCardProps[], sort: GameSort) {
  return [...games].sort((a, b) => {
    if (sort === "rating") return (b.aggregated_rating || 0) - (a.aggregated_rating || 0);
    if (sort === "date") return (b.first_release_date || 0) - (a.first_release_date || 0);
    if (sort === "popularity") return (b.hypes || 0) - (a.hypes || 0);
    return a.name.localeCompare(b.name);
  });
}

/// Sort-only narrowing for any page listing a mixed set of games (a
/// platform, a genre's own catalogue, a developer, etc).
export function useGameFilterSort(games: GameCardProps[]) {
  const [sort, setSort] = useState<GameSort>("rating");
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
  return (
    <div className="mb-6 flex justify-end">
      <Select label="Sort by" options={GAME_SORTS} value={sort} onValueChange={setSort} align="end" />
    </div>
  );
}
