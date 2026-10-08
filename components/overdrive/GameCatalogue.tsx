"use client";

import { GameCardProps } from "@/utils/types";
import { GameGridCard } from "./GameCards";
import { LoadMoreButton, NoResults } from "./EmptyState";
import { PageContainer } from "./PageShell";
import { PageHeading } from "@/components/ui";
import { CatalogueSkeleton, GameTileSkeletons } from "./Skeletons";
import { GameFilterBar, useGameFilterSort } from "./GameFilterBar";

export function GameCatalogue({
  title,
  subtitle,
  games,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
}: {
  title: string;
  subtitle?: string;
  games: GameCardProps[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const { covered, sort, setSort, visible } = useGameFilterSort(games);

  if (loading) return <CatalogueSkeleton />;

  return (
    <PageContainer>
      <PageHeading title={title} description={subtitle} />
      {covered.length === 0 ? (
        <NoResults description="No games found here yet. Check back later." />
      ) : (
        <>
          <div className="flex justify-end border-b border-ov-border pb-3.5">
            <GameFilterBar sort={sort} setSort={setSort} />
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {visible.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
            {loadingMore && <GameTileSkeletons count={8} />}
          </div>
          {hasMore && onLoadMore && (
            <LoadMoreButton onClick={onLoadMore} loading={loadingMore} />
          )}
        </>
      )}
    </PageContainer>
  );
}
