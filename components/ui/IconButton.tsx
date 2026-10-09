import { forwardRef, type ButtonHTMLAttributes } from "react";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type IconButtonVariant = "ghost" | "outline" | "overlay";

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost:
    "relative text-ov-dim hover:bg-ov-raised hover:text-ov-white aria-expanded:text-ov-teal aria-pressed:text-ov-rose",
  outline: "border border-ov-border-strong bg-ov-bg/80 text-ov-white hover:border-ov-faint",
  /// Over cover art: a dark glass chip; pressed is a wishlisted heart.
  overlay:
    "bg-ov-bg/72 text-ov-white backdrop-blur-md before:absolute before:-inset-1.5 hover:bg-ov-bg/90 aria-pressed:text-ov-rose",
};

/// Smaller sizes get an invisible ::before pad so every button is still a
/// 44px touch target.
const SIZES = {
  sm: "size-8 before:absolute before:-inset-1.5",
  md: "size-9 before:absolute before:-inset-1",
  lg: "size-11",
  xl: "size-12",
} as const;

const DEFAULT_SIZE: Record<IconButtonVariant, keyof typeof SIZES> = {
  ghost: "md",
  outline: "lg",
  overlay: "sm",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /// Required: an icon alone says nothing to a screen reader.
  label: string;
  variant?: IconButtonVariant;
  size?: keyof typeof SIZES;
  /// Text-size class for the glyph.
  iconClassName?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "ghost", size, iconClassName = "text-base", className, type, ...props },
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
        SIZES[size ?? DEFAULT_SIZE[variant]],
        className
      )}
      {...props}
    >
      <OvIcon name={icon} className={iconClassName} />
    </button>
  );
});
