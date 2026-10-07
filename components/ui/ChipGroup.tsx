"use client";

import { ToggleGroup } from "radix-ui";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type ChipOption<T extends string> = { value: T; label: string; icon?: IconName };

const ITEM: Record<"chip" | "underline", string> = {
  chip:
    "inline-flex items-center gap-1.5 border border-ov-border px-2.5 py-1 text-label text-ov-text transition-[color,background-color,border-color,scale] duration-150 hover:border-ov-teal hover:text-ov-teal active:scale-95 data-[state=on]:border-ov-teal data-[state=on]:bg-ov-teal data-[state=on]:text-ov-bg",
  underline:
    "-mb-px border-b-2 border-transparent px-4 py-2 text-xs tracking-hud-wide text-ov-muted transition-colors duration-150 hover:text-ov-teal data-[state=on]:border-ov-teal data-[state=on]:text-ov-teal",
};

/// Single-choice set of pills: filters, sort orders, view modes. Radix's
/// ToggleGroup supplies roving focus (one tab stop, arrow keys between options)
/// and pressed state for assistive tech.
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onValueChange,
  variant = "chip",
  className,
}: {
  /// Accessible name for the group, e.g. "Genre".
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  variant?: "chip" | "underline";
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      // Radix lets a single group deselect to ""; a filter always has a value.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cx(
        "flex flex-wrap",
        variant === "chip" ? "gap-1.5" : "border-b border-ov-border",
        className
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item key={option.value} value={option.value} className={ITEM[variant]}>
          {option.icon && <OvIcon name={option.icon} className="text-xs" />}
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
