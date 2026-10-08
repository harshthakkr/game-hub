"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import type { GameCardProps } from "@/utils/types";
import {
  GENRES,
  PLATFORMS,
  RATINGS,
  SORTS,
  YEARS,
  type CatalogFilters,
  type CatalogSort,
} from "@/utils/catalog";
import { GameGridCard, GameListRow } from "@/components/overdrive/GameCards";
import {
  CatalogueSkeleton,
  GameGridSkeleton,
  GameTileSkeletons,
} from "@/components/overdrive/Skeletons";
import { LoadMoreButton } from "@/components/overdrive/EmptyState";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { Button, ChipGroup, Eyebrow, Select, type ChipOption } from "@/components/ui";

const ANY = "any";
const PAGE_SIZE = 40;

type FilterKey = "genre" | "platform" | "year" | "rating";

const FILTERS: {
  key: FilterKey;
  label: string;
  anyLabel: string;
  options: readonly { value: string; label: string }[];
}[] = [
  { key: "genre", label: "GENRE", anyLabel: "All genres", options: GENRES },
  { key: "platform", label: "PLATFORM", anyLabel: "Any platform", options: PLATFORMS },
  { key: "year", label: "RELEASE YEAR", anyLabel: "Any year", options: YEARS },
  { key: "rating", label: "CRITIC RATING", anyLabel: "Any rating", options: RATINGS },
];

const VIEWS: readonly ChipOption<"grid" | "list">[] = [
  { value: "grid", label: "Grid", icon: "grid" },
  { value: "list", label: "List", icon: "list" },
];

function withAny(options: readonly { value: string; label: string }[], anyLabel: string) {
  return [{ value: ANY, label: anyLabel }, ...options];
}

/// Reads and writes the filter set in the URL, so a filtered catalogue can be
/// shared, bookmarked and restored with the back button.
function useCatalogParams() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: CatalogFilters = {
    genre: params.get("genre") ?? undefined,
    platform: params.get("platform") ?? undefined,
    year: params.get("year") ?? undefined,
    rating: params.get("rating") ?? undefined,
    sort: (params.get("sort") as CatalogSort | null) ?? "rating",
  };
  const view: "grid" | "list" = params.get("view") === "list" ? "list" : "grid";

  const set = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        const isDefault =
          value === null ||
          value === ANY ||
          (key === "sort" && value === "rating") ||
          (key === "view" && value === "grid");
        if (isDefault) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  // The data query ignores the view, so changing it doesn't refetch.
  const dataKey = FILTERS.map((f) => `${f.key}=${filters[f.key] ?? ""}`)
    .concat(`sort=${filters.sort}`)
    .join("&");

  return { filters, view, set, dataKey };
}

function useCatalog(dataKey: string) {
  const [games, setGames] = useState<GameCardProps[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const fetchPage = useCallback(
    (offset: number) => axios.get<GameCardProps[]>(`/api/games?${dataKey}&offset=${offset}`),
    [dataKey]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchPage(0)
      .then((res) => {
        if (cancelled) return;
        setGames(res.data);
        const header = Number(res.headers["x-total-count"]);
        setTotal(Number.isFinite(header) && header > 0 ? header : res.data.length || 0);
        setHasMore(res.data.length >= PAGE_SIZE);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchPage, attempt]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchPage(games.length);
      setGames((prev) => [...prev, ...res.data]);
      setHasMore(res.data.length >= PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, games.length, hasMore, loadingMore]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { games, total, loading, loadingMore, hasMore, failed, loadMore, retry };
}

function catalogueTitle(filters: CatalogFilters) {
  const genre = GENRES.find((g) => g.value === filters.genre);
  return genre ? `${genre.label} games` : "All games";
}

function Catalogue() {
  const { filters, view, set, dataKey } = useCatalogParams();
  const { games, total, loading, loadingMore, hasMore, failed, loadMore, retry } = useCatalog(dataKey);

  const active = FILTERS.flatMap(({ key, options }) => {
    const option = options.find((o) => o.value === filters[key]);
    return option ? [{ key, label: option.label }] : [];
  });
  const clearAll = () => set({ genre: null, platform: null, year: null, rating: null });

  return (
    <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-4 pt-8 pb-24 md:px-8 md:pt-10 xl:grid-cols-[232px_minmax(0,1fr)]">
      {/* Desktop: every filter visible in a sticky rail. */}
      <aside
        aria-label="Filters"
        className="sticky top-[calc(var(--ov-topbar-h)+32px)] hidden flex-col gap-7 xl:flex"
      >
        <div className="flex flex-col gap-2">
          <Eyebrow>GENRE</Eyebrow>
          <ChipGroup
            label="Genre"
            variant="list"
            options={withAny(GENRES, "All genres")}
            value={filters.genre ?? ANY}
            onValueChange={(v) => set({ genre: v })}
          />
        </div>
        {FILTERS.slice(1).map((f) => (
          <div key={f.key} className="flex flex-col gap-2.5">
            <Eyebrow>{f.label}</Eyebrow>
            <ChipGroup
              label={f.label.toLowerCase()}
              options={withAny(f.options, "Any")}
              value={filters[f.key] ?? ANY}
              onValueChange={(v) => set({ [f.key]: v })}
            />
          </div>
        ))}
      </aside>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h1 className="text-[32px] font-semibold tracking-[-0.02em] md:text-4xl">
            {catalogueTitle(filters)}
          </h1>
          {total !== null && !loading && !failed && (
            <span className="flex items-baseline gap-2" aria-live="polite">
              <span className="font-orbitron text-base font-bold text-ov-teal">
                {total.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-ov-muted">{total === 1 ? "game" : "games"}</span>
            </span>
          )}
        </div>

        {/* Below xl: the filters collapse into a row of dropdowns. */}
        <div className="flex gap-3 overflow-x-auto pb-1 xl:hidden">
          {FILTERS.map((f) => (
            <Select
              key={f.key}
              label={f.label}
              options={withAny(f.options, f.anyLabel)}
              value={filters[f.key] ?? ANY}
              onValueChange={(v) => set({ [f.key]: v })}
              className="shrink-0"
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-ov-border pb-3.5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {active.map((chip) => (
              <span
                key={chip.key}
                className="flex items-center gap-1.5 border border-ov-teal-deep bg-ov-teal/8 py-1 pr-1.5 pl-2.5 text-ui text-ov-teal-hover"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => set({ [chip.key]: null })}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="flex size-[18px] items-center justify-center hover:text-ov-white"
                >
                  <OvIcon name="close" className="text-xs" />
                </button>
              </span>
            ))}
            {active.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          <ChipGroup
            label="Sort by"
            variant="segmented"
            options={SORTS}
            value={filters.sort ?? "rating"}
            onValueChange={(v) => set({ sort: v })}
          />
          <ChipGroup
            label="View"
            variant="segmented"
            options={VIEWS}
            value={view}
            onValueChange={(v) => set({ view: v })}
          />
        </div>

        {loading ? (
          <GameGridSkeleton />
        ) : failed ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 border border-dashed border-ov-border-strong px-6 py-16 text-center"
          >
            <p className="text-lg font-semibold">Couldn&apos;t load the catalogue</p>
            <p className="text-sm text-ov-dim">The game database didn&apos;t respond. Try again in a moment.</p>
            <Button variant="secondary" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border border-dashed border-ov-border-strong px-6 py-[72px] text-center">
            <Eyebrow>NO MATCHES</Eyebrow>
            <p className="text-lg font-semibold">No games fit these filters</p>
            <p className="text-sm text-ov-dim">Try removing a filter or widening the year range.</p>
            <Button variant="secondary" onClick={clearAll} className="mt-2">
              Clear all filters
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {games.map((game) => (
              <GameGridCard key={game.id ?? game.slug} game={game} />
            ))}
            {loadingMore && <GameTileSkeletons count={8} />}
          </div>
        ) : (
          <div>
            <div
              aria-hidden
              className="hidden grid-cols-[48px_minmax(0,1fr)_120px_52px_110px_36px_150px] gap-x-4 px-2.5 pb-2.5 font-mono text-micro tracking-label text-ov-muted lg:grid"
            >
              <span />
              <span>TITLE</span>
              <span>GENRE</span>
              <span>RATING</span>
              <span className="text-right">BEST PRICE</span>
            </div>
            {games.map((game) => (
              <GameListRow key={game.id ?? game.slug} game={game} />
            ))}
          </div>
        )}

        {hasMore && !loading && games.length > 0 && (
          <LoadMoreButton onClick={loadMore} loading={loadingMore} />
        )}
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <Catalogue />
    </Suspense>
  );
}
