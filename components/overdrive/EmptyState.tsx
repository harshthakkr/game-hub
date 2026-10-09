"use client";

import { useEffect, useRef } from "react";
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

/// Infinite scroll for paginated lists. Rather than "after N% of the batch",
/// it triggers on distance: the next page starts loading once the end of
/// the list is within ~1.5 screen heights, so it's usually in before anyone
/// reaches the bottom, whatever the screen or batch size. `count` (items
/// loaded) re-arms it after each page, so a short page that still shows the
/// trigger keeps loading. A visible button stays as the fallback for
/// keyboards and browsers without IntersectionObserver.
export function AutoLoadMore({
  onLoadMore,
  loading,
  hasMore,
  count,
}: {
  onLoadMore: () => void;
  loading?: boolean;
  hasMore: boolean;
  count: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const load = useRef(onLoadMore);
  load.current = onLoadMore;

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && load.current(),
      { rootMargin: "0px 0px 150% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, count]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className="flex min-h-11 items-center justify-center">
      <span role="status" className="sr-only">
        {loading ? "Loading more" : ""}
      </span>
      {loading ? (
        <span aria-hidden className="flex items-center gap-2.5 font-hud text-ui text-ov-muted">
          <span className="size-2 rotate-45 animate-ov-pulse bg-ov-teal" />
          Loading more
        </span>
      ) : (
        <Button variant="ghost" size="sm" iconRight="chevron-down" onClick={onLoadMore}>
          Load more
        </Button>
      )}
    </div>
  );
}
