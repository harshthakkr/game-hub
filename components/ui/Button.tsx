import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "live"
  | "light";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  /// The one call to action per view.
  primary: "bg-ov-teal text-ov-teal-ink hover:bg-ov-teal-hover",
  /// Solid neutral; pressed (aria-pressed) turns it teal for "saved" toggles.
  secondary:
    "border border-ov-border-strong bg-ov-raised text-ov-white hover:border-ov-faint aria-pressed:border-ov-teal-deep aria-pressed:text-ov-teal-hover",
  /// Transparent neutral, for secondary actions on busy surfaces.
  outline:
    "border border-ov-border-strong text-ov-text hover:bg-ov-raised hover:text-ov-white",
  /// Text-only, for low-emphasis actions like Cancel.
  ghost: "text-ov-dim hover:text-ov-white",
  /// Destructive or "remove"; also the pressed state of a wishlist toggle.
  danger:
    "border border-ov-rose-deep bg-ov-rose-wash text-ov-rose-soft hover:border-ov-rose",
  live: "bg-ov-rose-strong text-white hover:brightness-110",
  /// Third-party sign-in ("Continue with Google"): a light, neutral fill.
  light: "bg-ov-white text-ov-bg hover:bg-white",
};

const SIZES: Record<ButtonSize, { box: string; icon: string }> = {
  sm: { box: "h-8 gap-1.5 px-3 text-label", icon: "text-sm" },
  /// 44px on phones (minimum touch target), 40px with a pointer.
  md: { box: "h-11 gap-2 px-4 text-ui lg:h-10", icon: "text-base" },
  lg: { box: "h-12 gap-2.5 px-6 text-sm", icon: "text-base" },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /// Leading and trailing icons, sized to the label.
  icon?: IconName;
  iconRight?: IconName;
  /// Disables the button and swaps the leading icon for a spinner.
  loading?: boolean;
  /// Cut bottom-right corner. Defaults on for md/lg, off for compact sm.
  chamfer?: boolean;
  /// Render the single child (a Link or <a>) with button styling instead.
  asChild?: boolean;
}

/// The one button. Every call-to-action, toggle and inline action in the app is
/// a variant of this, so focus, disabled and pressed states stay consistent.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "outline",
    size = "md",
    icon,
    iconRight,
    loading = false,
    chamfer,
    asChild = false,
    className,
    children,
    disabled,
    type,
    ...props
  },
  ref
) {
  const Comp = asChild ? Slot.Root : "button";
  const s = SIZES[size];
  const cut = chamfer ?? size !== "sm";

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        // Caps + tracking: buttons are HUD controls. Sizes step down one
        // notch to compensate for the taller caps.
        "inline-flex shrink-0 items-center justify-center font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-[filter,background-color,border-color,color,scale] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        cut && "ov-chamfer ov-chamfer-sm",
        s.box,
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner className={s.icon} />
      ) : (
        icon && <OvIcon name={icon} className={s.icon} />
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
      {iconRight && <OvIcon name={iconRight} className={s.icon} />}
    </Comp>
  );
});
