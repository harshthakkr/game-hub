import { forwardRef, type ButtonHTMLAttributes } from "react";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type IconButtonVariant = "ghost" | "outline" | "overlay";

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost:
    "size-9 text-ov-dim hover:bg-ov-raised hover:text-ov-white aria-expanded:text-ov-teal aria-pressed:text-ov-rose",
  outline:
    "size-11 border border-ov-border-strong bg-ov-bg/80 text-ov-white hover:border-ov-faint",
  /// Over cover art: a dark glass chip; pressed is a wishlisted heart.
  overlay:
    "size-8 bg-ov-bg/72 text-ov-white backdrop-blur-md hover:bg-ov-bg/90 aria-pressed:text-ov-rose",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /// Required: an icon alone says nothing to a screen reader.
  label: string;
  variant?: IconButtonVariant;
  /// Text-size class for the glyph.
  iconClassName?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "ghost", iconClassName = "text-base", className, type, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center leading-none transition-[color,background-color,border-color,scale,translate] duration-150 active:scale-90 disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      <OvIcon name={icon} className={iconClassName} />
    </button>
  );
});
