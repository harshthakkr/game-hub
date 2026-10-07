"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameCardProps } from "@/utils/types";
import { OvIcon } from "./OvIcon";

const SORTS = [
  { label: "Rating", key: "rating" },
  { label: "Release date", key: "date" },
  { label: "Popularity", key: "popularity" },
  { label: "A – Z", key: "az" },
];

/// Sort-only narrowing for any page listing a mixed set of games (a
/// platform, a genre's own catalogue, a developer, etc).
export function useGameFilterSort(games: GameCardProps[]) {
  const [sort, setSort] = useState("rating");

  const covered = useMemo(() => games.filter((g) => g.cover), [games]);

  const visible = useMemo(() => {
    return [...covered].sort((a, b) => {
      if (sort === "rating")
        return (b.aggregated_rating || 0) - (a.aggregated_rating || 0);
      if (sort === "date")
        return (b.first_release_date || 0) - (a.first_release_date || 0);
      if (sort === "popularity") return (b.hypes || 0) - (a.hypes || 0);
      if (sort === "az") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [covered, sort]);

  return { covered, sort, setSort, visible };
}

export function GameFilterBar({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (s: string) => void;
}) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const currentSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="mb-6 flex justify-end">
      <div ref={sortMenuRef} className="relative flex flex-col items-end gap-1.5">
        <span className="text-label tracking-wide text-ov-dim">Sort by</span>
        <button
          type="button"
          onClick={() => setSortMenuOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={sortMenuOpen}
          className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-label tracking-hud transition-colors duration-150 hover:border-ov-teal hover:text-ov-teal active:scale-[0.97] ${
            sortMenuOpen ? "border-ov-teal text-ov-teal" : "border-ov-border text-ov-text"
          }`}
        >
          {currentSort.label.toUpperCase()}
          <OvIcon
            name="chevron-down"
            className={`text-micro transition-transform duration-200 ${sortMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {sortMenuOpen && (
          <div
            role="listbox"
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-[170px] origin-top-right animate-ov-pop border border-ov-teal bg-ov-panel shadow-ov-pop"
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
  );
}
