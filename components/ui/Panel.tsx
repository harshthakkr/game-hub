import type { HTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cx } from "@/utils/cx";

/// Bordered surface with the signature cut corner: sidebars, tiles, rows. With
/// `interactive` it lights its border on hover/focus (pair with asChild + a Link).
export function Panel({
  asChild = false,
  cut = "br",
  surface = "panel",
  interactive = false,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  /// "br": the cut bottom-right corner. "none": square.
  cut?: "br" | "none";
  surface?: "panel" | "field" | "none";
  interactive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      className={cx(
        cut === "br" && "ov-chamfer",
        "border border-ov-border",
        surface === "panel" && "bg-ov-panel",
        surface === "field" && "bg-ov-field",
        interactive &&
          "transition-[border-color,background-color] duration-150 hover:border-ov-border-strong focus-visible:border-ov-teal",
        className
      )}
      {...props}
    />
  );
}
