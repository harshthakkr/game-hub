import { verdictMeta, verdictVars } from "@/utils/reviews";

/// A reviewer's verdict: a diamond and label in the tier's color. The label
/// carries the meaning; the color is reinforcement.
export function VerdictBadge({ verdict }: { verdict: string }) {
  const meta = verdictMeta(verdict);
  return (
    <span
      style={verdictVars(meta.color)}
      className="inline-flex items-center gap-1.5 border border-ov-border-strong px-2.5 py-1 text-ui font-semibold whitespace-nowrap text-(--verdict)"
    >
      <span aria-hidden className="size-[7px] rotate-45 bg-(--verdict)" />
      {meta.label}
    </span>
  );
}
