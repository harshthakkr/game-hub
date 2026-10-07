"use client";

import { VERDICTS, verdictMeta, verdictVars, type Verdict } from "@/utils/reviews";
import { OvIcon } from "../OvIcon";
import type { ReviewStats } from "@/utils/types";

/// Consensus panel: the modal verdict plus a distribution bar per tier. Rows are
/// filter toggles, so this doubles as the verdict filter control.
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
  const peak = Math.max(1, ...Object.values(stats.counts));

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-orbitron text-xs font-bold tracking-hud-wide text-ov-rose">
          PLAYER CONSENSUS
        </span>
        <span className="ml-auto text-label tracking-hud text-ov-muted">
          {stats.total} {stats.total === 1 ? "REVIEW" : "REVIEWS"}
        </span>
      </div>

      {consensus ? (
        <div
          className="ov-chamfer-x mt-3.5 inline-block border border-(--verdict) bg-(--verdict)/7 px-4 py-2.5 font-orbitron text-2xl font-black tracking-hud text-(--verdict)"
          style={verdictVars(consensus.color)}
        >
          {consensus.label}
        </div>
      ) : (
        <div className="mt-3.5 font-orbitron text-lg font-black text-ov-muted">
          NO VERDICT YET
        </div>
      )}

      <div className="mt-4 space-y-1.5">
        {[...VERDICTS].reverse().map((tier) => {
          const count = stats.counts[tier.value] ?? 0;
          const active = activeVerdict === tier.value;
          const share = (count / peak) * 100;

          return (
            <button
              key={tier.value}
              type="button"
              disabled={count === 0}
              onClick={() => onVerdictChange(active ? null : tier.value)}
              aria-pressed={active}
              className={`flex w-full items-center gap-3 border-l-2 px-1.5 py-1 text-left transition-all duration-150 hover:brightness-125 active:scale-[0.98] disabled:cursor-default disabled:opacity-40 disabled:active:scale-100 ${
                active ? "border-(--verdict) bg-(--verdict)/7" : "border-transparent bg-transparent"
              }`}
              style={verdictVars(tier.color)}
            >
              <span
                className={`w-[92px] shrink-0 text-micro font-semibold tracking-hud ${
                  active ? "text-(--verdict)" : "text-ov-dim"
                }`}
              >
                {tier.label}
              </span>
              <span className="h-[7px] min-w-0 flex-1 bg-ov-raised">
                <span
                  className="block h-full bg-(--verdict) transition-[width] duration-300"
                  style={{ width: `${share}%` }}
                />
              </span>
              <span className="w-7 shrink-0 text-right font-orbitron text-label font-bold text-ov-text">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {activeVerdict && (
        <button
          type="button"
          onClick={() => onVerdictChange(null)}
          className="mt-3 text-micro tracking-hud text-ov-teal transition-opacity duration-150 hover:opacity-75"
        >
          <OvIcon name="close" className="mr-1 text-micro" />
          CLEAR VERDICT FILTER
        </button>
      )}
    </div>
  );
}
