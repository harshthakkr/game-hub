"use client";

import Link from "next/link";
import { OvIcon, type IconName } from "./OvIcon";
import { Button } from "@/components/ui";

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
      <Button asChild variant="primary" className="mt-5">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
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
      <Button
        variant="secondary"
        onClick={onClick}
        loading={loading}
        iconRight={loading ? undefined : "chevron-down"}
      >
        {loading ? "LOADING" : "LOAD MORE"}
      </Button>
    </div>
  );
}
