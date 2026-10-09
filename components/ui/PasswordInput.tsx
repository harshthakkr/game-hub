"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";
import { Input } from "./Field";

/// Password field with a show/hide toggle. The button keeps one label and
/// reports its state with aria-pressed (a label that flips between "Show"
/// and "Hide" would contradict the pressed state). `className` goes on the
/// wrapper, so margins work as on a plain Input.
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={cx("relative", className)}>
      <Input ref={ref} type={visible ? "text" : "password"} className="pr-12" {...props} />
      <button
        type="button"
        aria-label="Show password"
        aria-pressed={visible}
        aria-controls={props.id}
        // Pointer/tap: keep focus (and the phone keyboard) in the field.
        // Keyboard users who Tab here still focus the button as usual.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ov-muted transition-colors duration-150 hover:text-ov-white"
      >
        <OvIcon name={visible ? "eye-off" : "eye"} className="text-lg" />
      </button>
    </div>
  );
});
