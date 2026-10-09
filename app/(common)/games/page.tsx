"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import type { GameCardProps } from "@/utils/types";
import {
  GENRES,
  PLATFORMS,
  RATINGS,
  DEFAULT_SORT,
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
import { AutoLoadMore } from "@/components/overdrive/EmptyState";
import { readCache, writeCache } from "@/utils/hooks/useCachedJson";
import { useRestoreScroll } from "@/utils/navMemory";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { Button, ChipGroup, Eyebrow, IconButton, Select, Sheet, SheetOption, Switch, type ChipOption, GAME_GRID } from "@/components/ui";
import { cx } from "@/utils/cx";

const ANY = "any";
const PAGE_SIZE = 40;

type FilterKey = "genre" | "platform" | "year" | "rating";
type Staged = Partial<Record<FilterKey | "sale", string>>;

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
    sale: params.get("sale") ?? undefined,
    sort: (params.get("sort") as CatalogSort | null) ?? DEFAULT_SORT,
  };
  const view: "grid" | "list" = params.get("view") === "list" ? "list" : "grid";

  const set = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        const isDefault =
          value === null ||
          value === ANY ||
          (key === "sort" && value === DEFAULT_SORT) ||
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
    .concat(`sale=${filters.sale ?? ""}`, `sort=${filters.sort}`)
    .join("&");

  return { filters, view, set, dataKey };
}

type CatalogState = { games: GameCardProps[]; total: number | null; hasMore: boolean };

/// The catalogue's results for a filter set. Every loaded page is kept in the
/// session cache, so the back button brings back everything you'd scrolled
/// through (and the scroll position, see utils/navMemory).
function useCatalog(dataKey: string) {
  const cacheKey = `catalog:${dataKey}`;
  const [state, setState] = useState<CatalogState>(
    () => readCache<CatalogState>(cacheKey) ?? { games: [], total: null, hasMore: false }
  );
  const [loading, setLoading] = useState(() => !readCache(cacheKey));
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { games, total, hasMore } = state;

  const update = useCallback(
    (next: CatalogState) => {
      writeCache(cacheKey, next);
      setState(next);
    },
    [cacheKey]
  );

  const fetchPage = useCallback(
    (offset: number) => axios.get<GameCardProps[]>(`/api/games?${dataKey}&offset=${offset}`),
    [dataKey]
  );

  useEffect(() => {
    const cached = readCache<CatalogState>(cacheKey);
    if (cached && attempt === 0) {
      setState(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetchPage(0)
      .then((res) => {
        if (cancelled) return;
        const header = Number(res.headers["x-total-count"]);
        update({
          games: res.data,
          total: Number.isFinite(header) && header > 0 ? header : res.data.length || 0,
          hasMore: res.data.length >= PAGE_SIZE,
        });
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [cacheKey, fetchPage, attempt, update]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetchPage(games.length);
      update({ games: [...games, ...res.data], total, hasMore: res.data.length >= PAGE_SIZE });
    } catch {
      update({ games, total, hasMore: false });
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, games, total, hasMore, loadingMore, update]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { games, total, loading, loadingMore, hasMore, failed, loadMore, retry };
}

/// Live result count for a staged filter set, so the sheet's button can say
/// "Apply · 24 results" before anything is applied.
function useStagedCount(staged: Staged, enabled: boolean) {
  const [count, setCount] = useState<number | null>(null);
  const key = JSON.stringify(staged);
  useEffect(() => {
    if (!enabled) return;
    setCount(null);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ count: "1" });
      for (const [k, v] of Object.entries(staged)) if (v) params.set(k, v);
      axios
        .get<{ count: number }>(`/api/games?${params.toString()}`, { signal: controller.signal })
        .then((res) => setCount(res.data.count))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `key` is the serialised staged set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);
  return count;
}

/// Phone filters: choices are staged in the sheet and applied together.
function FilterSheet({
  open,
  onOpenChange,
  filters,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CatalogFilters;
  onApply: (staged: Staged) => void;
}) {
  const initial: Staged = {
    genre: filters.genre,
    platform: filters.platform,
    year: filters.year,
    rating: filters.rating,
    sale: filters.sale,
  };
  const [staged, setStaged] = useState<Staged>(initial);
  const count = useStagedCount(staged, open);

  useEffect(() => {
    if (open) setStaged(initial);
    // Re-seed from the applied filters each time the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      actions={
        <Button variant="ghost" size="sm" onClick={() => setStaged({})} className="h-11">
          Reset
        </Button>
      }
      footer={
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={count === 0}
          onClick={() => {
            onApply(staged);
            onOpenChange(false);
          }}
        >
          {count === null ? "Apply" : count === 0 ? "No results" : `Apply · ${count.toLocaleString("en-IN")} results`}
        </Button>
      }
    >
      <div className="flex flex-col gap-5.5 p-4">
        {FILTERS.map((f) => (
          <div key={f.key} className="flex flex-col gap-2.5">
            <Eyebrow tick>{f.label}</Eyebrow>
            <div role="radiogroup" aria-label={f.label.toLowerCase()} className="flex flex-wrap gap-2">
              {withAny(f.options, "Any").map((o) => {
                const on = (staged[f.key] ?? ANY) === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setStaged((prev) => ({ ...prev, [f.key]: o.value === ANY ? undefined : o.value }))}
                    className={cx(
                      "h-11 border px-3.5 text-sm transition-colors",
                      on
                        ? "border-ov-teal-deep bg-ov-teal/8 text-ov-teal-hover"
                        : "border-ov-border text-ov-text hover:border-ov-border-strong"
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-ov-border pt-4">
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-body font-medium">On sale only</span>
            <span className="text-ui text-ov-muted">Discounted on PS Store or Steam</span>
          </span>
          <Switch
            checked={staged.sale === "1"}
            onCheckedChange={(on) => setStaged((prev) => ({ ...prev, sale: on ? "1" : undefined }))}
          >
            <span className="sr-only">On sale only</span>
          </Switch>
        </div>
      </div>
    </Sheet>
  );
}

function catalogueTitle(filters: CatalogFilters) {
  const genre = GENRES.find((g) => g.value === filters.genre);
  return genre ? genre.label : "Catalogue";
}

function Catalogue() {
  const { filters, view, set, dataKey } = useCatalogParams();
  const { games, total, loading, loadingMore, hasMore, failed, loadMore, retry } = useCatalog(dataKey);
  useRestoreScroll(!loading);

  const [filterSheet, setFilterSheet] = useState(false);
  const [sortSheet, setSortSheet] = useState(false);
  const active: { key: FilterKey | "sale"; label: string }[] = FILTERS.flatMap(({ key, options }) => {
    const option = options.find((o) => o.value === filters[key]);
    return option ? [{ key, label: option.label }] : [];
  });
  if (filters.sale === "1") active.push({ key: "sale", label: "On sale" });
  const clearAll = () => set({ genre: null, platform: null, year: null, rating: null, sale: null });
  const sortLabel = SORTS.find((o) => o.value === filters.sort)?.label ?? "Popularity";

  return (
    <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-4 pt-5 pb-12 md:px-8 lg:pt-10 lg:pb-24 xl:grid-cols-[232px_minmax(0,1fr)]">
      {/* Desktop: every filter visible in a sticky rail. */}
      <aside
        aria-label="Filters"
        // Pinned for good: capped to the space between its sticky top and the
        // page's bottom padding (32 above, 96 below), so it always fits and
        // the end of the results can never push it up. Longer than that (short
        // laptop screens), it scrolls inside itself. The 4px inset keeps focus
        // rings from being clipped by the scroll box.
        className="sticky top-[calc(var(--ov-topbar-h)+32px)] -mx-1 hidden max-h-[calc(100dvh-var(--ov-topbar-h)-32px-96px)] flex-col gap-7 overflow-y-auto overscroll-contain px-1 py-1 [scrollbar-color:var(--color-ov-border-strong)_transparent] [scrollbar-width:thin] xl:flex"
      >
        <div className="flex flex-col gap-2">
          <Eyebrow tick>GENRE</Eyebrow>
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
            <Eyebrow tick>{f.label}</Eyebrow>
            <ChipGroup
              label={f.label.toLowerCase()}
              options={withAny(f.options, "Any")}
              value={filters[f.key] ?? ANY}
              onValueChange={(v) => set({ [f.key]: v })}
            />
          </div>
        ))}
        <Switch checked={filters.sale === "1"} onCheckedChange={(on) => set({ sale: on ? "1" : null })}>
          On sale only
        </Switch>
      </aside>

      {/* Page blocks: heading → toolbar → results, 24/32 apart. */}
      <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h1 className="font-orbitron text-[24px] leading-tight font-bold tracking-[0.04em] uppercase lg:text-[34px]">
            {catalogueTitle(filters)}
          </h1>
          {total !== null && !loading && !failed && (
            <span className="font-hud text-ui text-ov-muted lg:text-body" aria-live="polite">
              <span aria-hidden className="text-ov-teal">{"// "}</span>
              {total.toLocaleString("en-IN")} {total === 1 ? "title" : "titles"}
            </span>
          )}
        </div>

        {/* Phones: a sticky Filters / Sort / view bar opening sheets, with the
            applied filters as a scrollable row of removable chips. */}
        <div className="sticky top-(--ov-topbar-h) z-20 -mx-4 border-b md:-mx-8 border-ov-border bg-ov-bg/94 backdrop-blur-[14px] lg:hidden">
          <div className="flex gap-2 px-4 py-2 md:px-8">
            <button
              type="button"
              onClick={() => setFilterSheet(true)}
              className="flex h-11 flex-1 items-center justify-center gap-2 border border-ov-border-strong bg-ov-field text-sm font-medium"
            >
              <OvIcon name="list" className="text-base" />
              Filters
              {active.length > 0 && (
                <span className="bg-ov-teal px-1.5 font-hud text-label text-ov-teal-ink">{active.length}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSortSheet(true)}
              className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 border border-ov-border-strong bg-ov-field text-sm font-medium"
            >
              <span className="text-ov-muted">Sort</span>
              <span className="truncate">{sortLabel}</span>
              <OvIcon name="chevron-down" className="text-sm text-ov-dim" />
            </button>
            <IconButton
              icon={view === "grid" ? "list" : "grid"}
              label={view === "grid" ? "Show as list" : "Show as grid"}
              onClick={() => set({ view: view === "grid" ? "list" : "grid" })}
              size="lg"
              className="border border-ov-border-strong bg-ov-field"
            />
          </div>
          {active.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:px-8">
              {active.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => set({ [chip.key]: null })}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="flex h-11 shrink-0 items-center"
                >
                  <span className="flex h-[34px] items-center gap-1.5 border border-ov-teal-deep bg-ov-teal/8 pr-2 pl-3 text-ui whitespace-nowrap text-ov-teal-hover">
                    {chip.label}
                    <OvIcon name="close" className="text-xs" />
                  </span>
                </button>
              ))}
              <button type="button" onClick={clearAll} className="h-11 shrink-0 px-1.5 text-ui whitespace-nowrap text-ov-dim">
                Clear all
              </button>
            </div>
          )}
        </div>
        <FilterSheet
          open={filterSheet}
          onOpenChange={setFilterSheet}
          filters={filters}
          onApply={(staged) =>
            set({
              genre: staged.genre ?? null,
              platform: staged.platform ?? null,
              year: staged.year ?? null,
              rating: staged.rating ?? null,
              sale: staged.sale ?? null,
            })
          }
        />
        <Sheet open={sortSheet} onOpenChange={setSortSheet} title="Sort by">
          <div role="radiogroup" aria-label="Sort by" className="pb-2">
            {SORTS.map((o) => (
              <SheetOption
                key={o.value}
                label={o.label}
                selected={(filters.sort ?? DEFAULT_SORT) === o.value}
                onSelect={() => {
                  set({ sort: o.value });
                  setSortSheet(false);
                }}
              />
            ))}
          </div>
        </Sheet>

        {/* Tablets: the filters collapse into a row of dropdowns. */}
        <div className="hidden gap-3 overflow-x-auto pb-1 lg:flex xl:hidden">
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

        <div className="hidden flex-wrap items-center gap-3 border-b border-ov-border pb-4 lg:flex">
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
            value={filters.sort ?? DEFAULT_SORT}
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
          <div className={GAME_GRID}>
            {games.map((game) => (
              <GameGridCard key={game.id ?? game.slug} game={game} />
            ))}
            {loadingMore && <GameTileSkeletons count={8} />}
          </div>
        ) : (
          <div>
            <div
              aria-hidden
              className="hidden grid-cols-[48px_minmax(0,1fr)_120px_52px_110px_36px_150px] gap-x-4 px-2.5 pb-2.5 font-hud text-micro tracking-label text-ov-muted lg:grid"
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

        {!loading && games.length > 0 && (
          <AutoLoadMore onLoadMore={loadMore} loading={loadingMore} hasMore={hasMore} count={games.length} />
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
