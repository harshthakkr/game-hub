"use client";

import { useLayoutEffect, type MouseEvent } from "react";

/// Card → game page "hero" transition, on the native View Transitions API.
///
/// The clicked card's cover and title get view-transition names, the
/// navigation runs inside document.startViewTransition, and whichever screen
/// mounts first for that game (the loading skeleton or the page itself) names
/// its own cover and title, so the browser morphs one into the other. The
/// skeleton already knows the game (from here), so the cover lands instantly
/// even while the page's data is still loading.
///
/// Markup contract: a card root carries `data-vt-card`; a game screen root
/// carries `data-vt-hero={slug}`; inside either, the cover and title carry
/// `data-vt="cover"` and `data-vt="title"`. Hidden duplicates (phone and
/// desktop heroes) are fine: only rendered elements get a name.

export type HeroGame = { slug: string; name: string };
/// The card's already-loaded cover image (its currentSrc), so the skeleton
/// paints it straight from cache.
type PendingGame = HeroGame & { cover: string | null };

type Pending = { game: PendingGame; arrive: () => void; settled: boolean };
let pending: Pending | null = null;

const NAMES = { cover: "game-cover", title: "game-title" } as const;
const MAX_WAIT_MS = 800;

function nameTargets(scope: Element | null) {
  if (!scope) return;
  for (const el of scope.querySelectorAll<HTMLElement>("[data-vt]")) {
    // Skip covers/titles of cards nested in the scope (a game page's
    // "Similar games"): only the scope's own cover and title take part.
    const card = el.closest("[data-vt-card]");
    if (card && card !== scope) continue;
    const name = NAMES[el.dataset.vt as keyof typeof NAMES];
    // getClientRects is empty for display:none (e.g. the other breakpoint's hero).
    if (name && el.getClientRects().length) el.style.viewTransitionName = name;
  }
}

function clearNames() {
  for (const el of document.querySelectorAll<HTMLElement>("[data-vt]")) {
    el.style.viewTransitionName = "";
  }
}

function canTransition(event: MouseEvent) {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/// onClick for a link to a game page. Plain left clicks run the hero
/// transition; modified clicks (new tab etc.) and reduced motion fall
/// through to the link's normal behaviour.
export function startHeroNav(
  event: MouseEvent<HTMLElement>,
  game: HeroGame,
  push: (href: string) => void
) {
  if (!canTransition(event)) return;
  event.preventDefault();

  const card = event.currentTarget.closest("[data-vt-card]") ?? event.currentTarget;
  const img = card.querySelector<HTMLImageElement>('[data-vt="cover"] img, img[data-vt="cover"]');
  const target = { ...game, cover: img?.currentSrc || img?.src || null };
  clearNames();
  nameTargets(card);

  const transition = document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, MAX_WAIT_MS);
        pending = {
          game: target,
          settled: false,
          arrive: () => {
            clearTimeout(timer);
            // The old page is gone by now, so names can be reused.
            nameTargets(document.querySelector(`[data-vt-hero="${CSS.escape(target.slug)}"]`));
            resolve();
          },
        };
        push(`/games/${game.slug}`);
      })
  );
  transition.finished.finally(() => {
    clearNames();
    if (pending) pending.settled = true;
  });
}

/// The game the in-flight hero navigation is heading to, if it is `slug`.
/// The skeleton uses it to paint the cover and title before data arrives.
export function heroPending(slug?: string) {
  if (!pending || (slug !== undefined && pending.game.slug !== slug)) return null;
  return pending.game;
}

/// Call from a screen that renders `data-vt-hero={slug}`: tells a pending
/// transition the destination is on screen. `done` also forgets the pending
/// game (the real page has replaced the skeleton).
export function useHeroArrival(slug: string | undefined, done = false) {
  useLayoutEffect(() => {
    if (!slug || !pending || pending.game.slug !== slug) return;
    if (!pending.settled) pending.arrive();
    if (done) pending = null;
  }, [slug, done]);
}
