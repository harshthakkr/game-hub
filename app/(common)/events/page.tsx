"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useData } from "@/utils/hooks/useData";
import { EventCardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { AutoLoadMore, NoResults } from "@/components/overdrive/EmptyState";
import { EventsSkeleton, EventTileSkeletons } from "@/components/overdrive/Skeletons";
import { EventCard } from "@/components/overdrive/EventCard";
import { ChipGroup, PageHeading, tileGrid } from "@/components/ui";
import { eventTiming } from "@/utils/overdrive";
import { useRestoreScroll } from "@/utils/navMemory";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "month", label: "This month" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const EMPTY: Record<Filter, { title: string; description: string }> = {
  all: { title: "No events yet", description: "Check back later." },
  live: { title: "Nothing live right now", description: "Check upcoming events instead." },
  upcoming: { title: "Nothing scheduled yet", description: "New showcases are announced all the time." },
  month: { title: "Nothing this month", description: "Check upcoming events instead." },
};

/// Each tab is its own server query, so "Load more" pages through that tab
/// and disappears once it runs out (a page shorter than 20 means the end).
/// "This month" is bounded in the viewer's own timezone.
function eventsEndpoint(filter: Filter) {
  if (filter === "all") return "events";
  if (filter !== "month") return `events?status=${filter}`;
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000;
  return `events?status=month&from=${from}&to=${to}`;
}

/// The tab lives in the URL (?status=), so back returns to the same tab.
function useFilterParam(): [Filter, (next: Filter) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("status");
  const filter = (FILTERS.find((f) => f.value === raw)?.value ?? "all") as Filter;
  const setFilter = useCallback(
    (next: Filter) => router.replace(next === "all" ? pathname : `${pathname}?status=${next}`, { scroll: false }),
    [pathname, router]
  );
  return [filter, setFilter];
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <Events />
    </Suspense>
  );
}

function Events() {
  const [filter, setFilter] = useFilterParam();
  const endpoint = useMemo(() => eventsEndpoint(filter), [filter]);
  const { data: events, hasMore, loading, loadingMore, handlePagination } =
    useData<EventCardProps>(endpoint);
  // Full-page skeleton only on first load; switching tabs keeps the header
  // and filters in place and skeletons just the grid.
  const [ready, setReady] = useState(!loading);
  useEffect(() => {
    if (!loading) setReady(true);
  }, [loading]);
  useRestoreScroll(ready && !loading);

  const liveCount = events.filter((e) => eventTiming(e.start_time, e.end_time).state === "live").length;

  if (!ready) return <EventsSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Events" description="Showcases and broadcasts, in your local time.">
        {liveCount > 0 && (
          <span className="flex w-max items-center gap-2 border border-ov-rose-deep px-2.5 py-1.5 text-ui font-semibold text-ov-rose-soft">
            <span aria-hidden className="size-[7px] animate-ov-pulse rounded-full bg-ov-rose" />
            {liveCount} live now
          </span>
        )}
      </PageHeading>

      <ChipGroup
        label="Event status"
        options={FILTERS}
        value={filter}
        onValueChange={setFilter}
        className="border-b border-ov-border pb-4"
      />

      {loading ? (
        <div className={tileGrid(280)}>
          <EventTileSkeletons count={6} />
        </div>
      ) : events.length === 0 ? (
        <NoResults
          title={EMPTY[filter].title}
          description={EMPTY[filter].description}
        />
      ) : (
        <div className={tileGrid(280)}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} showStart />
          ))}
          {loadingMore && <EventTileSkeletons count={6} />}
        </div>
      )}
      {!loading && events.length > 0 && (
        <AutoLoadMore onLoadMore={handlePagination} loading={loadingMore} hasMore={hasMore} count={events.length} />
      )}
    </PageContainer>
  );
}
