import { useEffect, useState } from "react";
import axios from "axios";
import type { GameCardProps } from "@/utils/types";

/// Card data for a list of game ids (wishlist, library), in the ids' order.
/// Only ids it hasn't loaded yet are fetched, so removing a game (or undoing
/// that) doesn't refetch the whole list.
/// Games fetched by id this session, shared by every caller, so a list you
/// come back to (wishlist, library) renders at once and back/forward can
/// restore its scroll position.
const known = new Map<number, GameCardProps>();

export function useGamesByIds(ids: number[], enabled: boolean) {
  const [byId, setById] = useState<Map<number, GameCardProps>>(() => new Map(known));
  const [loading, setLoading] = useState(() => !ids.every((id) => known.has(id)));
  const missing = ids.filter((id) => !byId.has(id));
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!enabled) return;
    if (!missingKey) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    axios
      .get<GameCardProps[]>(`/api/games?ids=${missingKey}`)
      .then((res) => {
        if (cancelled) return;
        setById((prev) => {
          const next = new Map(prev);
          for (const g of res.data) {
            if (!g.id) continue;
            next.set(g.id, g);
            known.set(g.id, g);
          }
          return next;
        });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [missingKey, enabled]);

  const games = ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  return { games, loading };
}
