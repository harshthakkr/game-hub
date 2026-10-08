"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Toast as RadixToast } from "radix-ui";

type ToastInput = {
  message: string;
  /// Optional single action, e.g. Undo.
  action?: { label: string; onClick: () => void };
};

type ToastItem = ToastInput & { id: number; open: boolean };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/// Fire-and-forget confirmations ("Added to wishlist"). Radix Toast announces
/// them politely to screen readers, pauses on hover/focus, supports swipe to
/// dismiss and gives keyboard users F8 to jump to the viewport.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((toast: ToastInput) => {
    // One at a time: a new confirmation replaces the previous one.
    setToasts((prev) => [
      ...prev.map((t) => ({ ...t, open: false })),
      { ...toast, id: Date.now() + Math.random(), open: true },
    ]);
  }, []);

  const close = (id: number) =>
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={show}>
      <RadixToast.Provider duration={4000} swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => (open ? null : close(toast.id))}
            onAnimationEnd={() => !toast.open && remove(toast.id)}
            className="flex items-center gap-3 border border-ov-border-strong bg-ov-field px-4.5 py-3.5 shadow-ov-pop data-[state=closed]:animate-ov-fade-out data-[state=open]:animate-ov-fade-up data-[swipe=end]:animate-ov-fade-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
          >
            <span aria-hidden className="size-2 shrink-0 rotate-45 bg-ov-teal" />
            <RadixToast.Title className="text-sm text-ov-white">{toast.message}</RadixToast.Title>
            {toast.action && (
              <RadixToast.Action
                altText={toast.action.label}
                onClick={toast.action.onClick}
                className="ml-auto shrink-0 text-sm font-semibold text-ov-teal hover:text-ov-teal-hover"
              >
                {toast.action.label}
              </RadixToast.Action>
            )}
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed right-4 bottom-4 z-[120] flex w-[min(440px,calc(100%-32px))] flex-col gap-2 outline-none md:right-7 md:bottom-7" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
