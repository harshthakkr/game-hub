"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useData } from "@/utils/hooks/useData";
import { GameCardProps } from "@/utils/types";
import { GameGridCard, GameListRow } from "@/components/overdrive/GameCards";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { GamesSkeleton, GameTileSkeletons } from "@/components/overdrive/Skeletons";
import { OvIcon } from "@/components/overdrive/OvIcon";

const GENRES = ["All", "Adventure", "RPG", "Indie", "Puzzle", "Shooter", "Platform"];
const SORTS = [
  { label: "Rating", key: "rating" },
  { label: "Release date", key: "date" },
  { label: "Popularity", key: "popularity" },
  { label: "A – Z", key: "az" },
];

export default function AllGames() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<GameCardProps>(
    "games",
    40
  );
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("rating");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const filtersMenuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filtersMenuRef.current && !filtersMenuRef.current.contains(target)) {
        setFiltersOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  const games = useMemo(() => {
    let list = data.filter((g) => g.cover);
    if (genre !== "All") {
      list = list.filter((g) =>
        (g.genres || []).some((x) =>
          x.name.toLowerCase().includes(genre.toLowerCase())
        )
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "rating")
        return (b.aggregated_rating || 0) - (a.aggregated_rating || 0);
      if (sort === "date")
        return (b.first_release_date || 0) - (a.first_release_date || 0);
      if (sort === "popularity") return (b.hypes || 0) - (a.hypes || 0);
      if (sort === "az") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [data, genre, sort]);

  if (loading) return <GamesSkeleton />;

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-0 pt-3 lg:px-6 xl:pt-0">
      <div className="flex flex-col gap-4 pb-[60px] xl:sticky xl:top-(--ov-topbar-h) xl:h-[calc(100dvh-var(--ov-topbar-h))] xl:flex-row xl:gap-7 xl:overflow-hidden xl:pb-0 xl:pt-6 xl:ov-grid-bg">
        <aside className="w-full shrink-0 xl:w-[210px] xl:overflow-y-auto xl:pb-6 xl:pt-1">
          {/* Desktop: filters and sort sit fully expanded in the sidebar. */}
          <div className="hidden xl:block">
            <div className="mb-3.5 border-l-[3px] border-ov-rose pl-2 font-orbitron text-label font-bold tracking-hud-wide text-ov-rose">
              FILTERS
            </div>
            <div className="mb-2 text-label tracking-wide text-ov-dim">GENRE</div>
            <div className="mb-5 flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const active = genre === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`border px-2.5 py-1 text-label transition-colors duration-150 active:scale-95 ${
                      active
                        ? "border-ov-teal bg-ov-teal text-ov-bg"
                        : "border-ov-border bg-transparent text-ov-text hover:border-ov-teal hover:text-ov-teal"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="mb-3.5 border-l-[3px] border-ov-rose pl-2 font-orbitron text-label font-bold tracking-hud-wide text-ov-rose">
              SORT BY
            </div>
            <div className="mb-5 flex flex-wrap gap-1.5">
              {SORTS.map((s) => {
                const active = s.key === sort;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSort(s.key)}
                    className={`border px-2.5 py-1 text-label transition-colors duration-150 active:scale-95 ${
                      active
                        ? "border-ov-teal bg-ov-teal text-ov-bg"
                        : "border-ov-border bg-transparent text-ov-text hover:border-ov-teal hover:text-ov-teal"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smaller screens: compact heading + dropdown pairs replace the
              always-expanded sidebar, keeping the catalogue close by. */}
          <div className="flex items-center gap-2.5 xl:hidden">
            <div ref={filtersMenuRef} className="relative flex flex-col gap-1.5">
              <span className="text-label tracking-wide text-ov-dim">Filter by</span>
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={filtersOpen}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-label tracking-hud transition-colors duration-150 active:scale-95 ${
                  filtersOpen || genre !== "All"
                    ? "border-ov-teal text-ov-teal"
                    : "border-ov-border text-ov-text"
                }`}
              >
                {genre.toUpperCase()}
                <OvIcon
                  name="chevron-down"
                  className={`text-micro transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                />
              </button>

              {filtersOpen && (
                <div
                  role="listbox"
                  className="animate-ov-pop absolute left-0 top-[calc(100%+6px)] z-50 w-[170px] origin-top-left border border-ov-teal bg-ov-panel shadow-ov-pop"
                >
                  {GENRES.map((g) => {
                    const active = g === genre;
                    return (
                      <button
                        key={g}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setGenre(g);
                          setFiltersOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs tracking-wide transition-colors duration-150 hover:bg-ov-raised ${
                          active ? "text-ov-teal" : "text-ov-text"
                        }`}
                      >
                        {g}
                        {active && <OvIcon name="check" className="text-micro" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={sortMenuRef} className="relative ml-auto flex flex-col items-end gap-1.5">
              <span className="text-label tracking-wide text-ov-dim">Sort by</span>
              <button
                type="button"
                onClick={() => setSortMenuOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortMenuOpen}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-label tracking-hud transition-colors duration-150 active:scale-95 ${
                  sortMenuOpen ? "border-ov-teal text-ov-teal" : "border-ov-border text-ov-text"
                }`}
              >
                {currentSort.label.toUpperCase()}
                <OvIcon
                  name="chevron-down"
                  className={`text-micro transition-transform ${sortMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {sortMenuOpen && (
                <div
                  role="listbox"
                  className="animate-ov-pop absolute right-0 top-[calc(100%+6px)] z-50 w-[170px] origin-top-right border border-ov-teal bg-ov-panel shadow-ov-pop"
                >
                  {SORTS.map((s) => {
                    const active = s.key === sort;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSort(s.key);
                          setSortMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs tracking-wide transition-colors duration-150 hover:bg-ov-raised ${
                          active ? "text-ov-teal" : "text-ov-text"
                        }`}
                      >
                        {s.label}
                        {active && <OvIcon name="check" className="text-micro" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 xl:pt-1">
            <span className="font-orbitron text-lg font-bold tracking-hud-wide text-white">
              CATALOGUE
            </span>
            <span className="text-ui text-ov-muted">
              // {games.length} titles
            </span>
            <div className="ml-auto flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs leading-none transition-colors duration-150 active:scale-95 ${
                  view === "grid"
                    ? "border-ov-teal bg-ov-teal text-ov-bg"
                    : "border-ov-border text-ov-muted hover:border-ov-teal hover:text-ov-teal"
                }`}
              >
                <OvIcon name="grid" className="text-xs leading-none" />
                <span>GRID</span>
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs leading-none transition-colors duration-150 active:scale-95 ${
                  view === "list"
                    ? "border-ov-teal bg-ov-teal text-ov-bg"
                    : "border-ov-border text-ov-muted hover:border-ov-teal hover:text-ov-teal"
                }`}
              >
                <OvIcon name="list" className="text-xs leading-none" />
                <span>LIST</span>
              </button>
            </div>
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
