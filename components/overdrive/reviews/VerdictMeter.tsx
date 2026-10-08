"use client";

import { VERDICTS, verdictMeta, verdictVars, type Verdict } from "@/utils/reviews";
import type { ReviewStats } from "@/utils/types";
import { Eyebrow } from "@/components/ui";
import { VerdictPips } from "./VerdictPips";
import { cx } from "@/utils/cx";

/// Consensus card: the modal verdict plus a distribution bar per tier. Rows
/// are filter toggles, so this doubles as the verdict filter control.
export function VerdictMeter({
  stats,
  activeVerdict,
  onVerdictChange,
}: {
  stats: ReviewStats;
  activeVerdict: Verdict | null;
  onVerdictChange: (verdict: Verdict | null) => void;
}) {
  const consensus = stats.consensus ? verdictMeta(stats.consensus) : null;
  const share =
    stats.consensus && stats.total ? Math.round((stats.counts[stats.consensus] / stats.total) * 100) : 0;

  return (
    <section
      aria-label="Player consensus"
      className="ov-chamfer flex flex-col gap-4 border border-ov-border bg-ov-panel p-5.5"
    >
      <Eyebrow>PLAYER CONSENSUS</Eyebrow>
      {consensus ? (
        <>
          <p
            className="flex items-center gap-3 text-[30px] leading-none font-semibold tracking-[-0.02em] text-(--verdict)"
            style={verdictVars(consensus.color)}
          >
            <VerdictPips verdict={stats.consensus} size="lg" />
            {consensus.label}
          </p>
          <p className="text-sm text-ov-dim">
            {share}% of {stats.total.toLocaleString("en-IN")} {stats.total === 1 ? "player" : "players"}. Pick a
            tier to filter.
          </p>
        </>
      ) : (
        <p className="text-sm text-ov-dim">No verdicts yet. Be the first to call it.</p>
      )}

      <div className="flex flex-col gap-1">
        {[...VERDICTS].reverse().map((tier) => {
          const count = stats.counts[tier.value] ?? 0;
          const active = activeVerdict === tier.value;
          const width = stats.total ? Math.max(2, Math.round((count / stats.total) * 100)) : 0;
          return (
            <button
              key={tier.value}
              type="button"
              disabled={count === 0}
              onClick={() => onVerdictChange(active ? null : tier.value)}
              aria-pressed={active}
              aria-label={`${tier.label}: ${count} ${count === 1 ? "review" : "reviews"}`}
              style={verdictVars(tier.color)}
              className={cx(
                "grid min-h-11 grid-cols-[128px_minmax(0,1fr)_44px] items-center gap-3 border px-2 lg:min-h-0 lg:py-[7px] text-left transition-colors duration-150 hover:bg-ov-field disabled:cursor-default disabled:opacity-40",
                active ? "border-(--verdict) bg-ov-field" : "border-transparent"
              )}
            >
              <span className="flex items-center gap-2 text-sm text-ov-text">
                <VerdictPips verdict={tier.value} />
                {tier.label}
              </span>
              <span className="h-2 bg-ov-raised">
                <span className="block h-full bg-(--verdict) transition-[width] duration-300" style={{ width: `${width}%` }} />
              </span>
              <span className="text-right font-mono text-label text-ov-dim">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
