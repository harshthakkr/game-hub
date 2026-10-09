import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "@/utils/cx";

const BASE =
  "block w-full border bg-ov-field text-ov-white outline-none transition-colors duration-150 placeholder:text-ov-muted disabled:opacity-50";

/// Border color doubles as the focus indicator, so fields opt out of the global
/// outline. `invalid` also sets aria-invalid.
function border(invalid?: boolean) {
  return invalid ? "border-ov-rose" : "border-ov-border-strong focus:border-ov-teal";
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ invalid, className, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      // 16px on phones: iOS zooms the page into any field smaller than that.
      className={cx(BASE, "h-12 px-3.5 text-base lg:text-body", border(invalid), className)}
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
        // Long-form writing (reviews, comments) reads in the body face.
        "resize-y font-body",
        size === "sm" ? "px-3 py-2 text-base leading-normal lg:text-sm" : "px-3.5 py-3 text-base leading-normal lg:text-body",
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
    <label htmlFor={htmlFor} className={cx("mb-1.5 block font-hud text-label font-semibold tracking-label text-ov-dim uppercase", className)}>
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
        "font-hud text-label",
        count > max ? "text-ov-rose" : "text-ov-muted",
        className
      )}
    >
      {count} / {max}
      {unit && ` ${unit}`}
    </span>
  );
}
