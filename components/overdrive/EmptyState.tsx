"use client";

import Link from "next/link";
import { OvIcon, type IconName } from "./OvIcon";
import { Button } from "@/components/ui";

/// Empty collection or page: a short title, why it's empty, and one way out.
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  iconClassName = "text-ov-dim",
}: {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  iconClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-ov-border-strong px-6 py-[72px] text-center">
      {icon && <OvIcon name={icon} className={`mb-1 text-3xl ${iconClassName}`} />}
      <p className="text-lg font-semibold text-ov-white">{title}</p>
      <p className="max-w-md text-sm text-ov-dim">{description}</p>
      <Button asChild variant="primary" className="mt-2">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

export function NoResults({
  title = "No results",
  description = "Nothing matches these filters right now. Try a different combination.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-ov-border-strong px-6 py-14 text-center">
      <p className="text-lg font-semibold text-ov-white">{title}</p>
      <p className="max-w-md text-sm text-ov-dim">{description}</p>
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
    // No margin: the page's own block gap places it under the grid.
    <div className="flex justify-center">
      <Button
        variant="secondary"
        onClick={onClick}
        loading={loading}
        iconRight={loading ? undefined : "chevron-down"}
      >
        {loading ? "Loading" : "Load more"}
      </Button>
    </div>
  );
}
