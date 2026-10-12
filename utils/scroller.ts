/// Which element scrolls the page.
///
/// On touch screens below laptop width the app scrolls inside #ov-scroll
/// (see app/globals.css) instead of the document. iOS browsers shrink their
/// toolbars as the *document* scrolls, and the page only learns the new size
/// once that animation ends, so bars pinned to the bottom of the screen
/// lagged behind it, leaving a gap. With the document never scrolling, the
/// toolbar never moves. Everywhere else the document scrolls as usual.
/// Anything that reads or sets the page's scroll goes through here.

export function scrollRoot(): HTMLElement {
  const el = document.getElementById("ov-scroll");
  if (el && getComputedStyle(el).overflowY !== "visible") return el;
  return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}

/// True when the page scrolls inside #ov-scroll rather than the document.
export const scrollsInContainer = () => scrollRoot().id === "ov-scroll";

export const getScrollY = () => scrollRoot().scrollTop;

export const scrollToY = (top: number) => scrollRoot().scrollTo({ top });

/// Height of the scrolling area on screen.
export const scrollViewportHeight = () =>
  scrollsInContainer() ? scrollRoot().clientHeight : window.innerHeight;

/// Listen to the page's scroll, whichever element is doing it. (A container's
/// scroll events don't reach window, so this listens on document in the
/// capture phase and ignores scrolls of nested scrollers like carousels.)
export function onPageScroll(fn: () => void): () => void {
  const handler = (e: Event) => {
    if (e.target === document || e.target === scrollRoot()) fn();
  };
  document.addEventListener("scroll", handler, { capture: true, passive: true });
  return () => document.removeEventListener("scroll", handler, { capture: true });
}

/// The IntersectionObserver root for "is this near the visible page?":
/// the container when it scrolls (so rootMargin can look past its edge),
/// otherwise the viewport.
export const observerRoot = () => (scrollsInContainer() ? scrollRoot() : null);
