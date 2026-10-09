import { verdictRank } from "@/utils/reviews";
import { cx } from "@/utils/cx";

/// Five rising bars with the first `rank` lit in the verdict's colour. The
/// count of lit bars carries the rank on its own, so the scale doesn't rely
/// on colour; it always sits next to the verdict's name. Expects the
/// `--verdict` custom property from an ancestor (verdictVars).
export function VerdictPips({
  verdict,
  size = "sm",
  className,
}: {
  /// A verdict value, or null for "no verdict yet" (all bars off).
  verdict: string | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const rank = verdict ? verdictRank(verdict) : 0;
  return (
    <span aria-hidden className={cx("flex items-end gap-0.5", className)}>
      {[0, 1, 2, 3, 4].map((k) => (
        <span
          key={k}
          className={cx(k < rank ? "bg-(--verdict)" : "bg-ov-border-strong", size === "lg" ? "w-[5px]" : "w-[3px]")}
          style={{ height: size === "lg" ? 8 + k * 4 : 4 + k * 2 }}
        />
      ))}
    </span>
  );
}
