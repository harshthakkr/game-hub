"use client";

import { useMemo, useState } from "react";
import { useData } from "@/utils/hooks/useData";
import { EventCardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { EventsSkeleton, EventTileSkeletons } from "@/components/overdrive/Skeletons";
import { EventCard } from "@/components/overdrive/EventCard";
import { ChipGroup, PageHeading } from "@/components/ui";
import { eventTiming, isThisCalendarMonth } from "@/utils/overdrive";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "month", label: "This month" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

export default function Events() {
  const { data, hasMore, loading, loadingMore, handlePagination } =
    useData<EventCardProps>("events");
  const [filter, setFilter] = useState<Filter>("all");

  const events = useMemo(
    () =>
      data.filter((e) => {
        const { state } = eventTiming(e.start_time, e.end_time);
        if (filter === "live") return state === "live";
        if (filter === "upcoming") return state === "upcoming" || state === "live";
        // What's actually happening in the current calendar month.
        if (filter === "month") return isThisCalendarMonth(e.start_time);
        return true;
      }),
    [data, filter]
  );

  const liveCount = data.filter((e) => eventTiming(e.start_time, e.end_time).state === "live").length;

  if (loading) return <EventsSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Events" description="Showcases and broadcasts, in your local time.">
        {liveCount > 0 && (
          <span className="flex items-center gap-2 border border-ov-rose-deep px-2.5 py-1.5 text-ui font-semibold text-ov-rose-soft">
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
        className="border-b border-ov-border pb-3.5"
      />

      {data.length === 0 ? (
        <NoResults description="No events found right now. Check back later." />
      ) : events.length === 0 ? (
        <NoResults
          title={filter === "live" ? "Nothing live right now" : "No matches"}
          description={filter === "live" ? "Check upcoming events instead." : "Try a different filter."}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
          {events.map((event) => (
            <EventCard key={event.id} event={event} showStart />
          ))}
          {loadingMore && <EventTileSkeletons count={6} />}
        </div>
      )}
      {hasMore && <LoadMoreButton onClick={handlePagination} loading={loadingMore} />}
    </PageContainer>
  );
}
