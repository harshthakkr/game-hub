import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export function useData<T>(endpoint: string, limit: number = 20) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    // A new endpoint (e.g. a different filter) starts a fresh list.
    setData([]);
    setHasMore(false);
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/${endpoint}`);
        if (cancelled) return;
        const batch = res.data as T[];
        setData(batch);
        // A short page means the source is exhausted, so there is nothing to load.
        setHasMore(batch.length >= limit);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [endpoint, limit]);

  const handlePagination = useCallback(async () => {
    // Guard against double taps queueing duplicate pages.
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const sep = endpoint.includes("?") ? "&" : "?";
      const res = await axios.get(`/api/${endpoint}${sep}offset=${data.length}`);
      const batch = res.data as T[];
      setData((prev) => [...prev, ...batch]);
      setHasMore(batch.length >= limit);
    } catch (error) {
      console.error("Error loading more:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [endpoint, data.length, limit, hasMore, loadingMore]);

  return { data, hasMore, loading, loadingMore, handlePagination };
}
