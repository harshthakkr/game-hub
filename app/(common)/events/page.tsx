"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useData } from "@/utils/hooks/useData";
import { EventCardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { EventsSkeleton, EventTileSkeletons } from "@/components/overdrive/Skeletons";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { ChipGroup, Panel } from "@/components/ui";
import { eventStatus, formatEventDate, isThisCalendarMonth } from "@/utils/overdrive";

const FILTERS = ["All", "Live now", "Upcoming", "This month"].map((f) => ({ value: f, label: f }));

export default function Events() {
  const { data, hasMore, loading, loadingMore, handlePagination } =
    useData<EventCardProps>("events");
  const [filter, setFilter] = useState("All");

  const events = useMemo(() => {
    return data.filter((e) => {
      const status = eventStatus(e.start_time, e.end_time);
      if (filter === "All") return true;
      if (filter === "Live now") return status.filter === "live";
      if (filter === "Upcoming")
        return status.filter === "upcoming" || status.filter === "live";
      // "This month": whatever is actually happening in the current
      // calendar month — not eventStatus's catch-all "month" bucket, which
      // also lumps in every past event and anything more than a month out.
      return isThisCalendarMonth(e.start_time);
    });
  }, [data, filter]);

  const liveCount = data.filter(
    (e) => eventStatus(e.start_time, e.end_time).filter === "live"
  ).length;

  if (loading) return <EventsSkeleton />;

  return (
    <PageContainer>
      <PageTitle
        title="EVENT"
        accent=" FEED"
        subtitle="global broadcast schedule"
        badge={
          <span
            className={`flex items-center border border-ov-rose px-3 py-1 text-label text-ov-rose ${
              liveCount ? "animate-ov-pulse" : ""
            }`}
          >
            <span aria-hidden className="mr-1.5 size-1.5 rounded-full bg-current" />
            {liveCount || 0} LIVE
          </span>
        }
      />

      <ChipGroup
        label="Event status"
        options={FILTERS}
        value={filter}
        onValueChange={setFilter}
        className="mb-6"
      />

      {data.length === 0 ? (
        <NoResults description="No events found right now. Check back later." />
      ) : (
        <>
          {events.length === 0 ? (
            <NoResults
              title="NO MATCHES"
              description="No events match this filter right now. Try a different one."
            />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
              {events.map((event) => {
                const logo = event.event_logo?.url
                  ? `https:${event.event_logo.url.replace("t_thumb", "t_1080p")}`
                  : null;
                const status = eventStatus(event.start_time, event.end_time);
                return (
                  <Panel asChild key={event.id} cut="br" surface="none" interactive className="group overflow-hidden">
                    <Link href={`/events/${event.slug}`}>
                      <div className="relative h-[130px] overflow-hidden bg-linear-to-br from-sky-700 to-slate-950">
                        {logo && (
                          <Image
                            src={logo}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="220px"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-ov-bg to-transparent" />
                        <span className="absolute right-2 top-2 bg-ov-bg/80 px-1.5 py-0.5 font-orbitron text-micro font-bold text-ov-rose">
                          {status.label}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <div className="text-ui font-semibold leading-snug text-white">
                          {event.name}
                        </div>
                        <div className="mt-2 text-label tracking-hud text-ov-teal">
                          <OvIcon name="clock" className="mr-1 text-label text-ov-teal" />
                          {formatEventDate(event.start_time)}
                        </div>
                      </div>
                    </Link>
                  </Panel>
                );
              })}
              {loadingMore && <EventTileSkeletons count={8} />}
            </div>
          )}

          {hasMore && events.length > 0 && (
            <LoadMoreButton onClick={handlePagination} loading={loadingMore} />
          )}
        </>
      )}
    </PageContainer>
  );
}
