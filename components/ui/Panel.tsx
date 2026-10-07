import type { HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cx } from "@/utils/cx";

/// Bordered, chamfered surface: sidebars, tiles, rows. With `interactive` it
/// lifts and lights its border on hover/focus (pair with asChild + a Link).
export function Panel({
  asChild = false,
  cut = "x",
  surface = "panel",
  interactive = false,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  /// "x": top-left and bottom-right corners. "br": bottom-right only.
  cut?: "x" | "br";
  surface?: "panel" | "sunken" | "none";
  interactive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      className={cx(
        cut === "x" ? "ov-chamfer-x" : "ov-chamfer",
        "border border-ov-border",
        surface === "panel" && "bg-ov-panel",
        surface === "sunken" && "bg-ov-sunken",
        interactive &&
          "transition-[border-color,translate,scale] duration-200 hover:-translate-y-1 hover:border-ov-teal focus-visible:border-ov-teal active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
