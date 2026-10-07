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
      <span id={labelId} className="text-label tracking-wide text-ov-dim">
        {label}
      </span>
      <RadixSelect.Root value={value} onValueChange={(next) => onValueChange(next as T)}>
        <RadixSelect.Trigger
          aria-labelledby={labelId}
          className={cx(
            "group inline-flex items-center gap-1.5 border px-3 py-1.5 text-label uppercase tracking-hud transition-colors duration-150 hover:border-ov-teal hover:text-ov-teal active:scale-[0.97] data-[state=open]:border-ov-teal data-[state=open]:text-ov-teal",
            // A non-default choice stays lit so an active filter is visible at rest.
            highlighted ? "border-ov-teal text-ov-teal" : "border-ov-border text-ov-text"
          )}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
            <OvIcon
              name="chevron-down"
              className="text-micro transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            align={align}
            sideOffset={6}
            className="z-50 min-w-[170px] origin-(--radix-select-content-transform-origin) border border-ov-teal bg-ov-panel shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-xs tracking-wide text-ov-text outline-none transition-colors duration-150 data-[highlighted]:bg-ov-raised data-[state=checked]:text-ov-teal"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <OvIcon name="check" className="text-micro" />
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
