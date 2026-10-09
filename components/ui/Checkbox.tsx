"use client";

import { useId, type ReactNode } from "react";
import { Checkbox as RadixCheckbox, Switch as RadixSwitch } from "radix-ui";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

export function Checkbox({
  checked,
  onCheckedChange,
  children,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <RadixCheckbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(state) => onCheckedChange(state === true)}
        className="flex size-[18px] shrink-0 items-center justify-center border border-ov-border-strong bg-ov-field text-ov-teal-ink transition-colors duration-150 data-[state=checked]:border-ov-teal data-[state=checked]:bg-ov-teal"
      >
        <RadixCheckbox.Indicator>
          <OvIcon name="check" className="text-xs" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className="cursor-pointer text-sm text-ov-text">
        {children}
      </label>
    </span>
  );
}

/// On/off setting that applies immediately ("Contains spoilers").
export function Switch({
  checked,
  onCheckedChange,
  children,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-[22px] w-10 shrink-0 bg-ov-border-strong p-[3px] transition-colors duration-200 data-[state=checked]:bg-ov-teal"
      >
        <RadixSwitch.Thumb className="block size-4 bg-ov-white transition-transform duration-200 data-[state=checked]:translate-x-[18px]" />
      </RadixSwitch.Root>
      <label htmlFor={id} className="cursor-pointer text-sm text-ov-text">
        {children}
      </label>
    </span>
  );
}
