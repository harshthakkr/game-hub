"use client";

import axios from "axios";
import { useEffect, useState } from "react";

/// Session cache shared by the client-side data hooks, so a page you come
/// back to renders its content immediately (and at full height, which is
/// what lets back/forward restore the scroll position, see utils/navMemory).
/// Entries younger than this are used as-is; older ones are refetched.
export const FRESH_MS = 10 * 60 * 1000;
const cache = new Map<string, { value: unknown; at: number }>();

export function readCache<T>(key: string): T | undefined {
  const hit = cache.get(key);
  return hit && Date.now() - hit.at < FRESH_MS ? (hit.value as T) : undefined;
}

export function writeCache(key: string, value: unknown) {
  cache.set(key, { value, at: Date.now() });
}

/// GET a JSON URL once per session (within FRESH_MS). `null` skips it.
export function useCachedJson<T>(url: string | null) {
  const [data, setData] = useState<T | null>(() => (url ? (readCache<T>(url) ?? null) : null));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;
    const hit = readCache<T>(url);
    if (hit !== undefined) {
      setData(hit);
      return;
    }
    let cancelled = false;
    axios
      .get<T>(url)
      .then((res) => {
        writeCache(url, res.data);
        if (!cancelled) setData(res.data);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, failed };
}
