"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GameCardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { PageHeading, GAME_GRID } from "@/components/ui";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { SearchSkeleton } from "@/components/overdrive/Skeletons";
import { NoResults } from "@/components/overdrive/EmptyState";
import { useCachedJson } from "@/utils/hooks/useCachedJson";
import { useRestoreScroll } from "@/utils/navMemory";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { data, failed } = useCachedJson<GameCardProps[]>(q.trim() ? `/api/search?q=${encodeURIComponent(q)}` : null);
  const results = (data ?? []).filter((g) => g.cover);
  const loading = !!q.trim() && data === null && !failed;
  useRestoreScroll(!loading);

  if (loading) return <SearchSkeleton />;

  return (
    <PageContainer>
      <PageHeading
        title="Search"
        note={`${results.length} ${results.length === 1 ? "hit" : "hits"} for “${q}”`}
      />

      {results.length > 0 ? (
        <div className={GAME_GRID}>
          {results.map((game) => (
            <GameGridCard key={game.id || game.slug} game={game} />
          ))}
        </div>
      ) : (
        <NoResults
          title="No matches"
          description={`Nothing in the grid matches "${q}". Try a different title, studio, or genre.`}
        />
      )}
    </PageContainer>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
