"use client";

import { useParams } from "next/navigation";
import { useData } from "@/utils/hooks/useData";
import { GameCardProps } from "@/utils/types";
import { GameCatalogue } from "@/components/overdrive/GameCatalogue";

export default function Genre() {
  const { slug } = useParams();
  const slugStr = String(slug || "");
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<GameCardProps>(
    `genres/${slugStr}`,
    40
  );

  return (
    <GameCatalogue
      title={slugStr.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      subtitle="Games in this genre, best rated first."
      games={data}
      loading={loading}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={handlePagination}
    />
  );
}
