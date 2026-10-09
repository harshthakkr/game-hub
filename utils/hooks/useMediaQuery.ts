import { useSyncExternalStore } from "react";

/// Live result of a media query. Server render and first paint assume false.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/// Below the `lg` breakpoint (800px): the phone layout with the tab bar.
export function useIsMobile() {
  return useMediaQuery("(max-width: 799px)");
}
