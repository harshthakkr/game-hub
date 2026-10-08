"use client";

import type { ComponentProps } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cx } from "@/utils/cx";

/// Underlined tab strip. Radix wires the tablist/tab/tabpanel roles, arrow-key
/// movement between tabs and the panel relationships.
export const Tabs = RadixTabs.Root;

export function TabsList({
  className,
  fill = false,
  ...props
}: ComponentProps<typeof RadixTabs.List> & {
  /// Phones: tabs share the width equally. Desktop: they sit left-aligned.
  fill?: boolean;
}) {
  return (
    <RadixTabs.List
      className={cx(
        fill
          ? "grid auto-cols-fr grid-flow-col lg:flex lg:gap-8"
          : "flex gap-8 overflow-x-auto [scrollbar-width:none]",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cx(
        "flex shrink-0 cursor-pointer items-center justify-center gap-2 py-3.5 text-body lg:justify-start lg:py-4 font-medium text-ov-dim shadow-[inset_0_-2px_0_transparent] transition-[color,box-shadow] duration-150 hover:text-ov-white data-[state=active]:text-ov-white data-[state=active]:shadow-[inset_0_-2px_0_var(--color-ov-teal)]",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cx("outline-none data-[state=active]:animate-ov-fade-up", className)}
      {...props}
    />
  );
}
