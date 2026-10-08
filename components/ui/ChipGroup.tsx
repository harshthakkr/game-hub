"use client";

import { ToggleGroup } from "radix-ui";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type ChipOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
  /// Optional trailing count, e.g. results per genre.
  count?: number;
};

export type ChipGroupVariant = "segmented" | "pill" | "list" | "underline";

const GROUP: Record<ChipGroupVariant, string> = {
  segmented: "inline-flex border border-ov-border",
  pill: "flex flex-wrap gap-1.5",
  list: "flex flex-col",
  underline: "flex gap-6 border-b border-ov-border",
};

const ITEM: Record<ChipGroupVariant, string> = {
  /// Joined buttons: sort orders, view modes, ranges.
  segmented:
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-ui font-medium text-ov-dim hover:text-ov-white data-[state=on]:bg-ov-raised data-[state=on]:text-ov-white data-[state=on]:shadow-[inset_0_-2px_0_var(--color-ov-teal)]",
  /// Standalone filter pills.
  pill:
    "inline-flex items-center gap-1.5 border border-ov-border px-2.5 py-1.5 text-ui text-ov-text hover:border-ov-border-strong hover:text-ov-white data-[state=on]:border-ov-teal-deep data-[state=on]:bg-ov-teal/8 data-[state=on]:text-ov-teal-hover",
  /// Vertical sidebar list with an accent bar on the active row.
  list: "flex items-center justify-between gap-3 px-2.5 py-2 text-left text-sm text-ov-dim hover:text-ov-white data-[state=on]:bg-ov-raised data-[state=on]:text-ov-white data-[state=on]:shadow-[inset_2px_0_0_var(--color-ov-teal)]",
  /// Tab-like strip.
  underline:
    "-mb-px border-b-2 border-transparent py-3 text-sm font-medium text-ov-dim hover:text-ov-white data-[state=on]:border-ov-teal data-[state=on]:text-ov-white",
};

/// Single-choice set of options: filters, sort orders, view modes, ranges.
/// Radix's ToggleGroup supplies roving focus (one tab stop, arrow keys
/// between options) and pressed state for assistive tech.
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onValueChange,
  variant = "pill",
  className,
}: {
  /// Accessible name for the group, e.g. "Genre".
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  variant?: ChipGroupVariant;
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      orientation={variant === "list" ? "vertical" : "horizontal"}
      value={value}
      // Radix lets a single group deselect to ""; a filter always has a value.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cx(GROUP[variant], className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cx(
            "shrink-0 whitespace-nowrap transition-colors duration-150",
            ITEM[variant]
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {option.icon && <OvIcon name={option.icon} className="text-sm" />}
            {option.label}
          </span>
          {option.count !== undefined && (
            <span className="font-hud text-label text-ov-muted">{option.count}</span>
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
