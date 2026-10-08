"use client";

import type { ComponentProps, ReactNode } from "react";
import { DropdownMenu } from "radix-ui";
import { cx } from "@/utils/cx";

/// Action menu (account menu and the like). Radix handles the menu roles,
/// arrow-key navigation, typeahead, Escape, and focus return to the trigger.
export function Menu({
  trigger,
  children,
  align = "end",
}: {
  /// A single focusable element, e.g. a <button>.
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="z-50 min-w-[220px] origin-(--radix-dropdown-menu-content-transform-origin) border border-ov-border-strong bg-ov-field p-1.5 shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/// Non-interactive header block at the top of a menu.
export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 border-b border-ov-border px-3 pt-2.5 pb-3">{children}</div>;
}

/// Mono caps caption above a group of items.
export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="px-2.5 py-2 font-mono text-micro uppercase tracking-label text-ov-muted">
      {children}
    </DropdownMenu.Label>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1.5 h-px bg-ov-border" />;
}

export function MenuItem({
  className,
  tone = "default",
  ...props
}: ComponentProps<typeof DropdownMenu.Item> & { tone?: "default" | "danger" }) {
  return (
    <DropdownMenu.Item
      className={cx(
        "flex w-full cursor-pointer items-center justify-between gap-3 px-2.5 py-2.5 text-sm outline-none transition-colors duration-150",
        tone === "danger"
          ? "text-ov-rose-soft data-[highlighted]:bg-ov-rose-wash"
          : "text-ov-text data-[highlighted]:bg-ov-raised data-[highlighted]:text-ov-white",
        className
      )}
      {...props}
    />
  );
}
