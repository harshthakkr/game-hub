"use client";

import { useCallback } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useData } from "@/utils/hooks/useData";
import { GameCardProps } from "@/utils/types";
import { DEFAULT_SORT, SORTS, type CatalogSort } from "@/utils/catalog";
import { GameCatalogue } from "@/components/overdrive/GameCatalogue";

export default function Platform() {
  const { slug } = useParams();
  const slugStr = String(slug || "");
  // Sort lives in the URL (?sort=), so back returns to the same order.
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sort = (SORTS.find((o) => o.value === params.get("sort"))?.value ?? DEFAULT_SORT) as CatalogSort;
  const setSort = useCallback(
    (next: CatalogSort) => router.replace(next === DEFAULT_SORT ? pathname : `${pathname}?sort=${next}`, { scroll: false }),
    [pathname, router]
  );
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
