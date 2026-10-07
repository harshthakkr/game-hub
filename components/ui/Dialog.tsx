"use client";

import { useRef, type ReactNode } from "react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import { cx } from "@/utils/cx";
import { Button } from "./Button";

/// Controlled dialogs here have no Radix <Trigger>, and without one Radix has
/// nowhere to send focus on close. Remember what had focus when the dialog
/// opened and hand it back, so keyboard users land where they left off.
function useReturnFocus() {
  const previous = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: () => {
      previous.current = document.activeElement as HTMLElement | null;
    },
    onCloseAutoFocus: (event: Event) => {
      if (previous.current?.isConnected) {
        event.preventDefault();
        previous.current.focus();
      }
    },
  };
}

const OVERLAY =
  "fixed inset-0 z-[100] backdrop-blur-[3px] data-[state=closed]:animate-ov-fade-out data-[state=open]:animate-ov-fade-up";

/// Modal panel with a titled header and close button. Radix provides the focus
/// trap, Escape and outside-click dismissal, scroll lock, focus return to the
/// trigger, and the dialog/title/description wiring for screen readers.
export function Dialog({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /// Small accent label above the title, e.g. "PRICE TRACKER".
  eyebrow?: string;
  title: ReactNode;
  /// Screen-reader summary of the dialog's purpose.
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const returnFocus = useReturnFocus();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={cx(OVERLAY, "bg-ov-bg/88")} />
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-3">
          {/* The chamfered frame doesn't scroll (its corner hairlines would
              scroll away with the content); the body inside it does. */}
          <RadixDialog.Content
            {...returnFocus}
            {...(!description && { "aria-describedby": undefined })}
            className={cx(
              "ov-chamfer-x pointer-events-auto flex max-h-full w-full flex-col border border-ov-border bg-ov-panel focus:outline-none data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-fade-up",
              className
            )}
          >
            <div className="flex shrink-0 items-start gap-4 border-b border-ov-border px-5 py-4">
              <div className="min-w-0 flex-1">
                {eyebrow && (
                  <div className="font-orbitron text-label font-bold tracking-hud-wide text-ov-rose">
                    {eyebrow}
                  </div>
                )}
                <RadixDialog.Title
                  className={cx(
                    "truncate font-orbitron text-lg font-bold text-white",
                    eyebrow && "mt-1.5"
                  )}
                >
                  {title}
                </RadixDialog.Title>
                {description ? (
                  <VisuallyHidden.Root asChild>
                    <RadixDialog.Description>{description}</RadixDialog.Description>
                  </VisuallyHidden.Root>
                ) : null}
              </div>
              <RadixDialog.Close asChild>
                <Button size="sm" variant="outline" icon="close">
                  CLOSE
                </Button>
              </RadixDialog.Close>
            </div>
            <div className="min-h-0 overflow-y-auto">{children}</div>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/// Edge-to-edge viewer shell (the screenshot lightbox) on the same behavior.
/// The visible chrome is up to the caller; the title is for screen readers.
export function FullscreenDialog({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const returnFocus = useReturnFocus();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={cx(OVERLAY, "bg-ov-bg/95")} />
        <RadixDialog.Content
          {...returnFocus}
          aria-describedby={undefined}
          className={cx(
            "fixed inset-0 z-[100] flex flex-col focus:outline-none data-[state=closed]:animate-ov-fade-out data-[state=open]:animate-ov-fade-up",
            className
          )}
        >
          <VisuallyHidden.Root asChild>
            <RadixDialog.Title>{title}</RadixDialog.Title>
          </VisuallyHidden.Root>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const DialogClose = RadixDialog.Close;
