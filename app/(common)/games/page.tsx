"use client";

import { useMemo, useState } from "react";
import { useData } from "@/utils/hooks/useData";
import { GameCardProps } from "@/utils/types";
import { GameGridCard, GameListRow } from "@/components/overdrive/GameCards";
import { GAME_SORTS, sortGames, type GameSort } from "@/components/overdrive/GameFilterBar";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { GamesSkeleton, GameTileSkeletons } from "@/components/overdrive/Skeletons";
import { ChipGroup, Eyebrow, SectionLabel, Select, type ChipOption } from "@/components/ui";

const GENRES = ["All", "Adventure", "RPG", "Indie", "Puzzle", "Shooter", "Platform"].map(
  (g) => ({ value: g, label: g })
);

const VIEWS: readonly ChipOption<"grid" | "list">[] = [
  { value: "grid", label: "GRID", icon: "grid" },
  { value: "list", label: "LIST", icon: "list" },
];

export default function AllGames() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<GameCardProps>(
    "games",
    40
  );
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState<GameSort>("rating");
  const [view, setView] = useState<"grid" | "list">("grid");

  const games = useMemo(() => {
    let list = data.filter((g) => g.cover);
    if (genre !== "All") {
      list = list.filter((g) =>
        (g.genres || []).some((x) =>
          x.name.toLowerCase().includes(genre.toLowerCase())
        )
      );
    }
    return sortGames(list, sort);
  }, [data, genre, sort]);

  if (loading) return <GamesSkeleton />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-0 pt-3 lg:px-6 xl:pt-0">
      <div className="flex flex-col gap-4 pb-[60px] xl:sticky xl:top-(--ov-topbar-h) xl:h-[calc(100dvh-var(--ov-topbar-h))] xl:flex-row xl:gap-7 xl:overflow-hidden xl:pb-0 xl:pt-6 xl:ov-grid-bg">
        <aside className="w-full shrink-0 xl:w-[210px] xl:overflow-y-auto xl:pb-6 xl:pt-1">
          {/* Desktop: filters and sort sit fully expanded in the sidebar. */}
          <div className="hidden xl:block">
            <SectionLabel bar className="mb-3.5">
              FILTERS
            </SectionLabel>
            <Eyebrow className="mb-2">GENRE</Eyebrow>
            <ChipGroup label="Genre" options={GENRES} value={genre} onValueChange={setGenre} className="mb-5" />
            <SectionLabel bar className="mb-3.5">
              SORT BY
            </SectionLabel>
            <ChipGroup label="Sort by" options={GAME_SORTS} value={sort} onValueChange={setSort} className="mb-5" />
          </div>

          {/* Smaller screens: compact dropdowns replace the always-expanded
              sidebar, keeping the catalogue close by. */}
          <div className="flex items-center justify-between gap-2.5 xl:hidden">
            <Select label="Filter by" options={GENRES} value={genre} onValueChange={setGenre} />
            <Select label="Sort by" options={GAME_SORTS} value={sort} onValueChange={setSort} align="end" />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 xl:pt-1">
            <h1 className="font-orbitron text-lg font-bold tracking-hud-wide text-white">
              CATALOGUE
            </h1>
            <span className="text-ui text-ov-muted">
              {"// "}
              {games.length} titles
            </span>
            <ChipGroup label="View" options={VIEWS} value={view} onValueChange={setView} className="ml-auto" />
          </div>

          <div className="min-h-0 flex-1 xl:overflow-y-auto xl:pb-8">
            {games.length === 0 ? (
              <NoResults
                title="NO MATCHES"
                description="No games match this filter right now. Try a different genre."
              />
            ) : view === "grid" ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
                {games.map((game) => (
                  <GameGridCard key={game.id || game.slug} game={game} />
                ))}
                {loadingMore && <GameTileSkeletons count={8} />}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {games.map((game) => (
                  <GameListRow key={game.id || game.slug} game={game} />
                ))}
              </div>
            )}

            {hasMore && games.length > 0 && (
              <LoadMoreButton onClick={handlePagination} loading={loadingMore} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
