"use client";

import { useRef, type ReactNode } from "react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import { cx } from "@/utils/cx";
import { IconButton } from "./IconButton";

/// Filters, sort, shelf picker, price history. Phones get a full-width
/// bottom sheet; from tablet width (586px) it becomes a centred panel, since
/// a bottom sheet stretched across a tablet spreads short option lists thin.
/// (Desktop, 800px+, uses Dialog/Menu instead.) Radix Dialog underneath, so it traps focus, closes on Escape or a tap on
/// the scrim, locks page scroll and returns focus to whatever opened it.
export function Sheet({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  actions,
  footer,
  full = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /// Screen-reader summary.
  description?: string;
  /// Header extras beside the close button, e.g. "Reset".
  actions?: ReactNode;
  /// Pinned below the scrolling body, e.g. "Apply · 24 results".
  footer?: ReactNode;
  /// Near full-height (price history) instead of content-height.
  full?: boolean;
  children: ReactNode;
}) {
  const previous = useRef<HTMLElement | null>(null);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-[rgb(2_3_8/0.72)] data-[state=closed]:animate-ov-fade-out data-[state=open]:animate-ov-fade-up" />
        <RadixDialog.Content
          {...(!description && { "aria-describedby": undefined })}
          onOpenAutoFocus={() => {
            previous.current = document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            if (previous.current?.isConnected) {
              event.preventDefault();
              previous.current.focus();
            }
          }}
          className={cx(
            "fixed inset-x-0 bottom-0 z-[100] flex flex-col border-t border-ov-border-strong bg-ov-field pb-[env(safe-area-inset-bottom)] focus:outline-none data-[state=closed]:animate-ov-sheet-out data-[state=open]:animate-ov-sheet-in",
            // Tablet: centred with inset-0 + margin auto, not a translate, so
            // the pop animation's transform can't knock it off centre.
            "md:inset-0 md:m-auto md:w-[min(560px,calc(100%-64px))] md:border md:pb-0 md:shadow-ov-pop md:data-[state=closed]:animate-ov-pop-out md:data-[state=open]:animate-ov-pop",
            full ? "top-5 md:h-fit md:max-h-[88dvh]" : "max-h-[88dvh] md:h-fit md:max-h-[80dvh]"
          )}
        >
          <div aria-hidden className="flex justify-center pt-2 md:hidden">
            <span className="h-1 w-9 bg-ov-border-strong" />
          </div>
          <div className="flex items-start gap-1 border-b border-ov-border py-1.5 pr-1.5 pl-4 md:py-2.5 md:pl-5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-2">
              <RadixDialog.Title className="text-lg font-semibold text-ov-white">{title}</RadixDialog.Title>
              {subtitle && <p className="truncate text-ui text-ov-muted">{subtitle}</p>}
              {description && (
                <VisuallyHidden.Root asChild>
                  <RadixDialog.Description>{description}</RadixDialog.Description>
                </VisuallyHidden.Root>
              )}
            </div>
            {actions}
            <RadixDialog.Close asChild>
              <IconButton icon="close" label="Close" size="lg" iconClassName="text-lg" />
            </RadixDialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-ov-border px-4 pt-3 pb-4">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/// One choice row in a sheet: radio semantics, 52px+ tall, optional detail
/// line and a leading marker.
export function SheetOption({
  selected,
  onSelect,
  label,
  detail,
  marker,
}: {
  selected: boolean;
  onSelect: () => void;
  label: ReactNode;
  detail?: ReactNode;
  marker?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "flex min-h-[52px] w-full items-center gap-3.5 px-4 py-2 text-left transition-colors",
        selected ? "bg-ov-raised shadow-[inset_2px_0_0_var(--color-ov-teal)]" : "hover:bg-ov-raised/60"
      )}
    >
      {marker}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cx("text-body font-medium", selected ? "text-ov-white" : "text-ov-text")}>{label}</span>
        {detail && <span className="text-ui text-ov-muted">{detail}</span>}
      </span>
      <span
        aria-hidden
        className={cx(
          "flex size-[22px] items-center justify-center border",
          selected ? "border-ov-teal" : "border-ov-border-strong"
        )}
      >
        {selected && <span className="size-2.5 bg-ov-teal" />}
      </span>
    </button>
  );
}
