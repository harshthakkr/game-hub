import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { readCache, writeCache } from "@/utils/hooks/useCachedJson";

type ListState<T> = { data: T[]; hasMore: boolean };

/// Paginated list from /api/<endpoint> (`?offset=` paging). Every loaded page
/// is kept in the session cache, so coming back to a list (back button)
/// renders everything you'd scrolled through at once, at full height, and
/// the scroll position can be restored. A new endpoint (filter, sort) starts
/// a fresh list, or picks up its own cached one.
export function useData<T>(endpoint: string, limit: number = 20) {
  const cacheKey = `list:${endpoint}`;
  const [state, setState] = useState<ListState<T>>(
    () => readCache<ListState<T>>(cacheKey) ?? { data: [], hasMore: false }
  );
  const [loading, setLoading] = useState<boolean>(() => !readCache(cacheKey));
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const { data, hasMore } = state;

  const update = useCallback(
    (next: ListState<T>) => {
      writeCache(cacheKey, next);
      setState(next);
    },
    [cacheKey]
  );

  useEffect(() => {
    const cached = readCache<ListState<T>>(cacheKey);
    if (cached) {
      setState(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    // A new endpoint (e.g. a different filter) starts a fresh list.
    setState({ data: [], hasMore: false });
    setLoading(true);
    axios
      .get(`/api/${endpoint}`)
      .then((res) => {
        if (cancelled) return;
        const batch = res.data as T[];
        // A short page means the source is exhausted, so there is nothing to load.
        update({ data: batch, hasMore: batch.length >= limit });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (!cancelled) setState({ data: [], hasMore: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, endpoint, limit, update]);

  const handlePagination = useCallback(async () => {
    // Guard against double triggers queueing duplicate pages.
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const sep = endpoint.includes("?") ? "&" : "?";
      const res = await axios.get(`/api/${endpoint}${sep}offset=${data.length}`);
      const batch = res.data as T[];
      update({ data: [...data, ...batch], hasMore: batch.length >= limit });
    } catch (error) {
      console.error("Error loading more:", error);
      update({ data, hasMore: false });
    } finally {
      setLoadingMore(false);
    }
  }, [endpoint, data, limit, hasMore, loadingMore, update]);

  return { data, hasMore, loading, loadingMore, handlePagination };
}
