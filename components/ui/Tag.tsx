import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export type TagTone = "neutral" | "teal" | "rose" | "deal" | "amber";

const TONES: Record<TagTone, string> = {
  neutral: "border border-ov-border-strong bg-ov-raised/88 text-ov-white",
  teal: "border border-ov-teal-deep bg-ov-teal/8 text-ov-teal-hover",
  rose: "border border-ov-rose-deep bg-ov-rose-wash text-ov-rose-soft",
  amber: "border border-ov-amber/60 bg-ov-field text-ov-amber",
  /// Solid green: discount badges ("-30%").
  deal: "bg-ov-deal font-orbitron font-bold text-ov-deal-ink",
};

/// Static label: genre, platform, status, discount. Not interactive; for a
/// pressable pill use ChipGroup.
export function Tag({
  children,
  tone = "neutral",
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: TagTone;
  /// sm: inline labels. md: chips in panels. badge: corner badges on cover art.
  size?: "sm" | "md" | "badge";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        { sm: "px-1.5 py-0.5 text-label", md: "px-2.5 py-1 text-ui", badge: "px-2 py-1 text-ui" }[size],
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
