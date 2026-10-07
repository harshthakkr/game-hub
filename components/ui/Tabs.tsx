"use client";

import type { ComponentProps } from "react";
import { Tabs as RadixTabs } from "radix-ui";
import { cx } from "@/utils/cx";

/// Underlined tab strip. Radix wires the tablist/tab/tabpanel roles, arrow-key
/// movement between tabs and the panel relationships.
export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cx("flex flex-wrap border-b border-ov-border", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cx(
        "-mb-px cursor-pointer border-b-2 border-transparent px-4 py-2.5 text-xs tracking-hud-wide text-ov-muted transition-colors duration-150 hover:text-ov-teal data-[state=active]:border-ov-teal data-[state=active]:text-ov-teal",
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
