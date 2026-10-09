"use client";

import { useLayoutEffect } from "react";

/// Back/forward scroll restoration for pages whose content loads in the
/// browser. The browser restores scroll the moment you go back, while such a
/// page is still a short skeleton, so the position gets clamped near the top
/// and the content then arrives with nothing to scroll back. Instead: record
/// each URL's scroll position, note when a navigation is a back/forward
/// traversal (not a link click), and let the page restore it once its
/// content (from the session cache, see useCachedJson/useData) is on screen.

const positions = new Map<string, number>();
/// The position to restore after a back/forward, captured at the moment of
/// the popstate, before the browser's own clamped attempt can overwrite it.
let pending: { key: string; y: number } | null = null;
let installed = false;

const keyOf = () => location.pathname + location.search;

/// Mount once in the app shell.
export function installNavMemory() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  let frame = 0;
  addEventListener(
    "scroll",
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const key = keyOf();
        // Don't record the clamped position while a restore is waiting.
        if (pending?.key !== key) positions.set(key, scrollY);
      });
    },
    { passive: true }
  );

  addEventListener("popstate", () => {
    const key = keyOf();
    const y = positions.get(key);
    pending = y === undefined ? null : { key, y };
  });

  // A link click (Next pushes a history entry) is a fresh visit: start at
  // the top as usual, nothing to restore.
  const push = history.pushState.bind(history);
  history.pushState = (...args: Parameters<History["pushState"]>) => {
    pending = null;
    return push(...args);
  };
}

/// Call on a page whose content loads client-side, with `ready` once that
/// content is rendered. After a back/forward it scrolls to where the reader
/// was; on a normal visit it does nothing.
export function useRestoreScroll(ready: boolean) {
  useLayoutEffect(() => {
    if (!ready || !pending || pending.key !== keyOf()) return;
    const { y } = pending;
    pending = null;
    window.scrollTo(0, y);
    // Once more after the browser's next layout pass (late images, fonts).
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [ready]);
}
