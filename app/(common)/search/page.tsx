"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { GameCardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { PageHeading } from "@/components/ui";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { SearchSkeleton } from "@/components/overdrive/Skeletons";
import { NoResults } from "@/components/overdrive/EmptyState";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<GameCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => setResults(res.data.filter((g: GameCardProps) => g.cover)))
      .finally(() => setLoading(false));
  }, [q]);

  if (loading) return <SearchSkeleton />;

  return (
    <PageContainer>
      <PageHeading
        title={`Results for “${q}”`}
        description={`${results.length} ${results.length === 1 ? "game" : "games"}`}
      />

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
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
