"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/utils/hooks/useData";
import { GameCardProps } from "@/utils/types";
import { DEFAULT_SORT, type CatalogSort } from "@/utils/catalog";
import { GameCatalogue } from "@/components/overdrive/GameCatalogue";

export default function Platform() {
  const { slug } = useParams();
  const slugStr = String(slug || "");
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_SORT);
  // Sorted on the server: a new sort is a new list, and pages append in order.
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<GameCardProps>(
    `platforms/${slugStr}?sort=${sort}`,
    40
  );

  return (
    <GameCatalogue
      title={slugStr.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      subtitle="Games on this platform."
      games={data}
      loading={loading}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={handlePagination}
      sort={sort}
      onSortChange={setSort}
    />
  );
}
