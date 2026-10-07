import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export type TagTone = "teal" | "rose" | "neutral";
export type TagVariant = "solid" | "outline";

const TONES: Record<TagTone, Record<TagVariant, string>> = {
  teal: {
    solid: "bg-ov-teal text-ov-bg",
    outline: "border border-ov-teal text-ov-teal",
  },
  rose: {
    solid: "bg-ov-rose text-ov-bg",
    outline: "border border-ov-rose text-ov-rose",
  },
  neutral: {
    solid: "bg-ov-raised text-ov-text",
    outline: "border border-ov-border text-ov-dim",
  },
};

/// Static label: genre, platform, status. Not interactive; for a pressable
/// pill use ChipGroup.
export function Tag({
  children,
  tone = "teal",
  variant = "outline",
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: TagTone;
  variant?: TagVariant;
  /// sm: overlay badges on cover art. md: chips in panels.
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-micro" : "px-2 py-0.5 text-label",
        TONES[tone][variant],
        className
      )}
    >
      {children}
    </span>
  );
}
