"use client";

import { useId } from "react";
import { Select as RadixSelect } from "radix-ui";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type SelectOption<T extends string> = { value: T; label: string };

/// Labelled single-select dropdown. Radix supplies the listbox semantics,
/// keyboard support (arrows, Home/End, type-to-select), collision-aware
/// positioning and focus return to the trigger on close.
export function Select<T extends string>({
  label,
  options,
  value,
  onValueChange,
  align = "start",
  className,
}: {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  align?: "start" | "end";
  className?: string;
}) {
  const labelId = useId();
  const highlighted = value !== options[0]?.value;

  return (
    <div
      className={cx(
        "flex flex-col gap-1.5",
        align === "end" ? "items-end" : "items-start",
        className
      )}
    >
      <span id={labelId} className="font-mono text-micro uppercase tracking-label text-ov-muted">
        {label}
      </span>
      <RadixSelect.Root value={value} onValueChange={(next) => onValueChange(next as T)}>
        <RadixSelect.Trigger
          aria-labelledby={labelId}
          className={cx(
            "group inline-flex h-9 items-center gap-2 border bg-ov-field px-3 text-sm transition-colors duration-150 hover:border-ov-faint data-[state=open]:border-ov-faint",
            // A non-default choice stays lit so an active filter is visible at rest.
            highlighted ? "border-ov-teal-deep text-ov-teal-hover" : "border-ov-border-strong text-ov-white"
          )}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
            <OvIcon
              name="chevron-down"
              className="text-sm text-ov-dim transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            align={align}
            sideOffset={6}
            className="z-50 min-w-[180px] origin-(--radix-select-content-transform-origin) border border-ov-border-strong bg-ov-field p-1.5 shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-2.5 py-2 text-sm text-ov-text outline-none transition-colors duration-150 data-[highlighted]:bg-ov-raised data-[highlighted]:text-ov-white data-[state=checked]:text-ov-teal-hover"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <OvIcon name="check" className="text-sm" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
