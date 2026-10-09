import { cx } from "@/utils/cx";

/// Indeterminate progress ring, sized in em so a text-size class sizes it.
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-block size-[1em] shrink-0 animate-ov-think rounded-full border-2 border-current border-t-transparent",
        className
      )}
    />
  );
}
