import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "@/utils/cx";

const BASE =
  "block w-full border bg-ov-panel text-ov-white outline-none transition-colors duration-150 placeholder:text-ov-muted disabled:opacity-50";

/// Border color doubles as the focus indicator, so fields opt out of the global
/// outline. `invalid` also sets aria-invalid.
function border(invalid?: boolean) {
  return invalid ? "border-ov-rose" : "border-ov-border focus:border-ov-teal";
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ invalid, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(BASE, "px-4 py-3 text-ui", border(invalid), className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; size?: "sm" | "md" }
>(function Textarea({ invalid, size = "md", className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        BASE,
        "resize-y",
        size === "sm" ? "px-3 py-2 text-ui leading-[1.7]" : "px-4 py-3 text-sm leading-[1.8]",
        border(invalid),
        className
      )}
      {...props}
    />
  );
});

export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cx("mb-2 block text-label tracking-wide text-ov-dim", className)}>
      {children}
    </label>
  );
}

/// "123 / 1000" style counter that turns rose past the limit.
export function CharCount({
  count,
  max,
  unit = "",
  className,
}: {
  count: number;
  max: number;
  unit?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "font-orbitron text-label font-bold",
        count > max ? "text-ov-rose" : "text-ov-muted",
        className
      )}
    >
      {count} / {max}
      {unit && ` ${unit}`}
    </span>
  );
}
