"use client";

import Link from "next/link";
import { OvIcon, type IconName } from "./OvIcon";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  iconClassName = "text-ov-rose",
}: {
  icon: IconName;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  iconClassName?: string;
}) {
  return (
    <div className="border border-dashed border-ov-border px-8 py-[60px] text-center">
      <div className={`mx-auto mb-3 flex justify-center ${iconClassName}`}>
        <OvIcon name={icon} className="text-4xl" />
      </div>
      <div className="font-orbitron text-base font-bold tracking-wide text-ov-text">
        {title}
      </div>
      <p className="mt-2.5 text-ui text-ov-muted">{description}</p>
      <Link
        href={actionHref}
        className="mt-5 inline-block bg-ov-teal px-5 py-2.5 font-orbitron text-label font-bold tracking-hud-wide text-ov-bg transition-transform duration-150 hover:brightness-110 active:scale-95"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export function NoResults({
  title = "NO RESULTS",
  description = "Nothing matches these filters right now. Try a different combination.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="border border-dashed border-ov-border px-8 py-[60px] text-center text-ov-muted">
      <div className="font-orbitron text-base font-bold tracking-hud-wide text-ov-text">
        {title}
      </div>
      <p className="mt-3 text-ui">{description}</p>
    </div>
  );
}

export function LoadMoreButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 border border-ov-teal bg-ov-teal/6 px-7 py-3 font-orbitron text-label font-bold tracking-hud-wide text-ov-teal transition-all duration-150 hover:bg-ov-teal/14 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
      >
        {loading ? (
          <>
            <span className="inline-block h-3 w-3 animate-ov-think border-2 border-ov-teal border-t-transparent" />
            LOADING
          </>
        ) : (
          <>
            LOAD MORE
            <OvIcon name="chevron-down" className="text-xs" />
          </>
        )}
      </button>
    </div>
  );
}
