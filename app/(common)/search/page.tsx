"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { GameCardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
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
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h1 className="font-orbitron text-title font-black tracking-hud-wide text-white">
          SEARCH
        </h1>
        <span className="text-sm text-ov-teal">
          {"// "}&quot;{q}&quot;
        </span>
        <span className="ml-auto text-ui text-ov-muted">
          {results.length} results
        </span>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
          {results.map((game) => (
            <GameGridCard key={game.id || game.slug} game={game} />
          ))}
        </div>
      ) : (
        <NoResults
          title="NO MATCHES FOUND"
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
