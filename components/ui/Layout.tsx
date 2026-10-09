import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

/// Spacing system. Every gap in the app should be one of these roles, on a
/// 4px grid, phone → desktop:
///
///   gutter          16 → 32 (from md)        PageContainer / page wrappers
///   page top/bottom 20 / 48 → 40 / 96 (lg)   PageContainer
///   page blocks     24 → 32                  heading → toolbar → content
///   sections        40 → 64                  sections of a long page (Discover)
///   nested sections 32 → 48                  sections inside a panel (game tabs)
///   section         16 → 20                  a section's heading → its content
///   game grid       12 × 24 → 20 × 32        cover cards (columns × rows)
///   tile grid       12 → 16                  platforms, genres, developers, events
///
/// Components own their *inner* padding; layouts own the gaps between them.
/// No margins on components, and no negative margins to patch a gap.

export const SECTIONS = "flex flex-col gap-10 lg:gap-16";
export const NESTED_SECTIONS = "flex flex-col gap-8 lg:gap-12";

/// Grid of game cover cards.
export const GAME_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-x-5 lg:gap-y-8";

/// Grid of tiles. `min` is the narrowest a tile may get before the grid
/// drops a column; `phoneCols` is the column count below sm.
export function tileGrid(min: 240 | 260 | 280, phoneCols: 1 | 2 = 1) {
  return cx(
    "grid gap-3 lg:gap-4",
    phoneCols === 2 ? "grid-cols-2" : "grid-cols-1",
    {
      240: "sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]",
      260: "sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]",
      280: "sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]",
    }[min]
  );
}

/// One section: a heading (SectionHeader / SubHeading) and its content, at
/// the standard heading → content distance.
export function Section({
  label,
  children,
  className,
}: {
  /// aria-label for the region, when the heading isn't wired by id.
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section aria-label={label} className={cx("flex flex-col gap-4 lg:gap-5", className)}>
      {children}
    </section>
  );
}
