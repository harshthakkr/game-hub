import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { OvIcon, type IconName } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "live";
export type ButtonSize = "sm" | "md" | "lg";

/// Filled variants set in Orbitron; outlined ones in the UI face.
const DISPLAY_FACE: Record<ButtonVariant, boolean> = {
  primary: true,
  live: true,
  secondary: false,
  outline: false,
  ghost: false,
  danger: false,
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-b from-ov-teal to-ov-teal-dark text-ov-bg hover:brightness-110",
  secondary:
    "border border-ov-teal bg-ov-teal/6 text-ov-teal hover:bg-ov-teal/14 aria-pressed:bg-ov-teal/16",
  outline:
    "border border-ov-border text-ov-dim hover:border-ov-teal hover:text-ov-teal",
  /// Text-only, for low-emphasis actions like Cancel.
  ghost: "text-ov-muted hover:text-ov-text",
  danger:
    "border border-ov-rose bg-ov-rose/8 text-ov-rose hover:bg-ov-rose hover:text-ov-bg",
  live: "bg-ov-rose text-ov-bg hover:brightness-110",
};

const SIZES: Record<ButtonSize, { box: string; display: string; ui: string; icon: string }> = {
  sm: { box: "gap-1 px-3 py-1.5", display: "text-micro", ui: "text-label", icon: "text-xs" },
  md: { box: "gap-1.5 px-[18px] py-3", display: "text-xs", ui: "text-ui", icon: "text-xs" },
  lg: { box: "w-full gap-2.5 px-4 py-3.5", display: "text-ui", ui: "text-sm", icon: "text-sm" },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /// Leading and trailing icons, sized to the label.
  icon?: IconName;
  iconRight?: IconName;
  /// Disables the button and swaps the leading icon for a spinner.
  loading?: boolean;
  /// Cut corners. Defaults on for md/lg, off for compact sm buttons.
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
  const display = DISPLAY_FACE[variant];
  const cut = chamfer ?? size !== "sm";

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap tracking-hud transition-[filter,background-color,border-color,color,scale] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        cut && "ov-chamfer-x ov-chamfer-sm",
        display ? `font-orbitron font-bold ${s.display}` : s.ui,
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
