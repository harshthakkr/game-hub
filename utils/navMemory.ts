"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getScrollY, onPageScroll, scrollRoot, scrollsInContainer, scrollToY } from "./scroller";

/// Back/forward scroll restoration. The browser restores the document's
/// scroll on back/forward, but too early for pages whose content loads in
/// the browser (the position gets clamped while the page is a short
/// skeleton), and not at all when the page scrolls inside a container (touch
/// screens, see utils/scroller). So: record each URL's scroll position, note
/// when a navigation is a back/forward traversal (not a link click), and
/// restore it once the page is tall enough to hold it.

const positions = new Map<string, number>();
/// The position to restore after a back/forward, captured at the moment of
/// the popstate, before a clamped scroll can overwrite it.
let pending: { key: string; y: number } | null = null;
let installed = false;
/// Set by a link click (pushState) to the page it left, so the new page can
/// start at the top once it renders.
let pushedFrom: string | null = null;

const keyOf = () => location.pathname + location.search;

/// Mount once in the app shell.
export function installNavMemory() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  let frame = 0;
  onPageScroll(() => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const key = keyOf();
      // Don't record the clamped position while a restore is waiting.
      if (pending?.key !== key) positions.set(key, getScrollY());
    });
  });

  // Capture phase, so this runs before Next's own popstate handler: React
  // applies a back/forward synchronously inside that handler, and the
  // restore below needs `pending` set by then.
  addEventListener(
    "popstate",
    () => {
      pushedFrom = null;
      const key = keyOf();
      const y = positions.get(key);
      pending = y === undefined ? null : { key, y };
    },
    true
  );

  // A link click (Next pushes a history entry) is a fresh visit: start at
  // the top as usual, nothing to restore.
  const push = history.pushState.bind(history);
  history.pushState = (...args: Parameters<History["pushState"]>) => {
    pending = null;
    pushedFrom = location.pathname;
    return push(...args);
  };
}

/// Scroll to the pending position once the page can hold it; gives up after
/// a couple of seconds (content that never arrives).
function restoreWhenTall() {
  let tries = 0;
  const attempt = () => {
    if (!pending || pending.key !== keyOf()) return;
    const root = scrollRoot();
    const { y } = pending;
    if (root.scrollHeight - root.clientHeight >= y - 1 || ++tries > 120) {
      pending = null;
      scrollToY(y);
      // Once more after the browser's next layout pass (late images, fonts).
      requestAnimationFrame(() => scrollToY(y));
      return;
    }
    requestAnimationFrame(attempt);
  };
  attempt();
}

/// For the app shell, when the page scrolls in a container (the browser
/// can't manage that scroll): after a back/forward, restore the position;
/// after a link to another page, start it at the top. (Next scrolls the new
/// page's content into view, which leaves it under the sticky top bar.)
export function useRouteScrollRestore() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!scrollsInContainer()) return;
    const frame = requestAnimationFrame(() => {
      if (pending) restoreWhenTall();
      else if (pushedFrom !== null && pushedFrom !== location.pathname) scrollToY(0);
      pushedFrom = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
}

/// Call on a page whose content loads client-side, with `ready` once that
/// content is rendered. After a back/forward it scrolls to where the reader
/// was; on a normal visit it does nothing.
export function useRestoreScroll(ready: boolean) {
  useLayoutEffect(() => {
    if (!ready || !pending || pending.key !== keyOf()) return;
    restoreWhenTall();
  }, [ready]);
}
