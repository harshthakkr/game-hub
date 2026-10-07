import { verdictMeta, verdictVars } from "@/utils/reviews";

export function VerdictBadge({
  verdict,
  size = "md",
}: {
  verdict: string;
  size?: "sm" | "md";
}) {
  const meta = verdictMeta(verdict);
  const compact = size === "sm";

  return (
    <span
      className={`ov-chamfer-x ov-chamfer-sm inline-block whitespace-nowrap border border-(--verdict) bg-(--verdict)/8 font-orbitron text-micro font-bold tracking-hud-wide text-(--verdict) ${
        compact ? "px-2 py-0.5" : "px-2.5 py-1"
      }`}
      style={verdictVars(meta.color)}
    >
      {meta.label}
    </span>
  );
}
