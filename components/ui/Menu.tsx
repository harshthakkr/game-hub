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
          className="z-50 min-w-[190px] origin-(--radix-dropdown-menu-content-transform-origin) border border-ov-border bg-ov-panel shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/// Non-interactive header block at the top of a menu.
export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-ov-border px-3.5 py-2.5">{children}</div>;
}

export function MenuItem({
  className,
  tone = "default",
  ...props
}: ComponentProps<typeof DropdownMenu.Item> & { tone?: "default" | "danger" }) {
  return (
    <DropdownMenu.Item
      className={cx(
        "flex w-full cursor-pointer items-center gap-2 px-3.5 py-2.5 text-label tracking-hud text-ov-dim outline-none transition-colors duration-150 data-[highlighted]:bg-ov-raised",
        tone === "danger" ? "data-[highlighted]:text-ov-rose" : "data-[highlighted]:text-ov-teal",
        className
      )}
      {...props}
    />
  );
}
