import { verdictMeta, verdictVars } from "@/utils/reviews";
import { VerdictPips } from "./VerdictPips";

/// A reviewer's verdict: the rank meter and the label in the tier's colour.
export function VerdictBadge({ verdict }: { verdict: string }) {
  const meta = verdictMeta(verdict);
  return (
    <span
      style={verdictVars(meta.color)}
      className="inline-flex items-center gap-1.5 border border-ov-border-strong px-2.5 py-1 text-ui font-semibold whitespace-nowrap text-(--verdict)"
    >
      <VerdictPips verdict={verdict} />
      {meta.label}
    </span>
  );
}
