"use client";

import { useEffect, useState } from "react";
import { GameCardProps } from "@/utils/types";
import type { CatalogSort } from "@/utils/catalog";
import { GameGridCard } from "./GameCards";
import { AutoLoadMore, NoResults } from "./EmptyState";
import { PageContainer } from "./PageShell";
import { useScreenTitle } from "./ScreenTitle";
import { PageHeading, GAME_GRID } from "@/components/ui";
import { CatalogueSkeleton, GameTileSkeletons } from "./Skeletons";
import { GameFilterBar } from "./GameFilterBar";

/// A paginated grid of games (a platform's, a genre's). Sorting happens on
/// the server: pass `sort` + `onSortChange` to show the control (the page
/// puts the sort in its request), and pages arrive already in order, so
/// infinite scroll only ever appends.
export function GameCatalogue({
  title,
  subtitle,
  games,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  sort,
  onSortChange,
}: {
  title: string;
  subtitle?: string;
  games: GameCardProps[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  sort?: CatalogSort;
  onSortChange?: (sort: CatalogSort) => void;
}) {
  useScreenTitle(title);
  const covered = games.filter((g) => g.cover);
  // Full-page skeleton only on first load; a sort change keeps the header
  // and control in place and skeletons just the grid.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);

  if (!ready) return <CatalogueSkeleton />;

  return (
    <PageContainer>
      <PageHeading title={title} description={subtitle} />
      {sort && onSortChange && (
        <div className="flex justify-end border-b border-ov-border pb-4">
          <GameFilterBar sort={sort} setSort={onSortChange} />
        </div>
      )}
      {loading ? (
        <div className={GAME_GRID}>
          <GameTileSkeletons count={12} />
        </div>
      ) : covered.length === 0 ? (
        <NoResults description="No games found here yet. Check back later." />
      ) : (
        <>
          <div className={GAME_GRID}>
            {covered.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
            {loadingMore && <GameTileSkeletons count={8} />}
          </div>
          {onLoadMore && (
            <AutoLoadMore onLoadMore={onLoadMore} loading={loadingMore} hasMore={!!hasMore} count={games.length} />
          )}
        </>
      )}
    </PageContainer>
  );
}
