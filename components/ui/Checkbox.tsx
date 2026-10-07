"use client";

import { useId, type ReactNode } from "react";
import { Checkbox as RadixCheckbox } from "radix-ui";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

const TONES = {
  teal: {
    box: "data-[state=checked]:border-ov-teal data-[state=checked]:bg-ov-teal/16 text-ov-teal",
    label: "peer-data-[state=checked]:text-ov-teal",
  },
  rose: {
    box: "data-[state=checked]:border-ov-rose data-[state=checked]:bg-ov-rose/16 text-ov-rose",
    label: "peer-data-[state=checked]:text-ov-rose",
  },
};

export function Checkbox({
  checked,
  onCheckedChange,
  children,
  tone = "teal",
  size = "md",
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  /// Rose for warnings ("contains spoilers"), teal otherwise.
  tone?: keyof typeof TONES;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(state) => onCheckedChange(state === true)}
        className={cx(
          "peer flex shrink-0 items-center justify-center border border-ov-border transition-colors duration-150",
          size === "sm" ? "size-4" : "size-[18px]",
          TONES[tone].box
        )}
      >
        <RadixCheckbox.Indicator>
          <OvIcon name="check" className={size === "sm" ? "text-micro" : "text-label"} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label
        htmlFor={id}
        className={cx(
          "cursor-pointer tracking-hud text-ov-dim transition-colors duration-150",
          size === "sm" ? "text-micro" : "text-label",
          TONES[tone].label
        )}
      >
        {children}
      </label>
    </span>
  );
}
