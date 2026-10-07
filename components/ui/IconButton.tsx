import { forwardRef, type ButtonHTMLAttributes } from "react";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export type IconButtonVariant = "ghost" | "outline" | "overlay";

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost: "text-ov-muted hover:text-ov-teal aria-expanded:text-ov-teal aria-pressed:text-ov-teal",
  outline:
    "ov-chamfer-x ov-chamfer-sm border border-ov-border bg-ov-panel/85 px-3 py-4 text-ov-text hover:border-ov-teal hover:text-ov-teal",
  /// Over cover art; a pressed overlay button is a wishlisted heart, so rose.
  overlay:
    "text-white/70 drop-shadow-[0_1px_4px_rgb(0_0_0/0.6)] hover:text-white aria-pressed:text-ov-rose",
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
  { icon, label, variant = "ghost", iconClassName = "text-sm", className, type, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center leading-none transition-[color,border-color,scale,translate] duration-150 hover:scale-110 active:scale-90 disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      <OvIcon name={icon} className={iconClassName} />
    </button>
  );
});
