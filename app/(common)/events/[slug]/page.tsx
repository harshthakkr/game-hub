"use client";

import Link from "next/link";
import Image from "next/image";
import { useSingleData } from "@/utils/hooks/useSingleData";
import { EventPageProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { useScreenTitle } from "@/components/overdrive/ScreenTitle";
import { Button, Eyebrow, SectionHeader, StatStrip } from "@/components/ui";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { EventDetailSkeleton } from "@/components/overdrive/Skeletons";
import { eventTiming, formatEventDateTime, googleCalendarUrl, igdbImage } from "@/utils/overdrive";
import { cx } from "@/utils/cx";

export default function EventPage() {
  const { data, loading } = useSingleData<EventPageProps>("events");
  useScreenTitle(data?.name);

  if (loading) return <EventDetailSkeleton />;
  if (!data?.name) {
    return (
      <PageContainer className="items-center text-center">
        <p className="text-lg font-semibold">We couldn&apos;t find that event</p>
        <Button asChild variant="secondary">
          <Link href="/events">All events</Link>
        </Button>
      </PageContainer>
    );
  }

  const logo = data.event_logo?.url ? igdbImage(data.event_logo.url, "t_1080p") : null;
  const timing = eventTiming(data.start_time, data.end_time);
  const games = (data.games || []).filter((g) => g.cover).slice(0, 10);
  // Past events can't be reminded about, so the calendar link is upcoming-only.
  const calendarUrl =
    timing.state === "upcoming" && data.start_time
      ? googleCalendarUrl({
          title: data.name,
          start: data.start_time,
          end: data.end_time,
          details: [data.description, data.live_stream_url].filter(Boolean).join("\n\n"),
          location: data.live_stream_url,
        })
      : null;

  return (
    <PageContainer className="gap-10">
      <span className="hidden lg:contents">
        <Button asChild size="sm" variant="ghost" icon="chevron-left" className="w-max">
          <Link href="/events">All events</Link>
        </Button>
      </span>

      <div className="flex flex-wrap items-start gap-10">
        <div className="ov-chamfer relative aspect-video max-w-[600px] flex-[1_1_420px] overflow-hidden bg-ov-raised">
          {logo && <Image src={logo} alt="" fill sizes="(min-width: 800px) 600px, 100vw" className="object-cover" />}
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <span
            className={cx(
              "flex items-center gap-2 text-ui font-semibold",
              timing.state === "live" ? "text-ov-rose-soft" : timing.state === "past" ? "text-ov-dim" : "text-ov-teal"
            )}
          >
            {timing.state === "live" && (
              <span aria-hidden className="size-[7px] animate-ov-pulse rounded-full bg-ov-rose" />
            )}
            {timing.badge}
          </span>
          <h1 className="text-[32px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance md:text-page">
            {data.name}
          </h1>
          <StatStrip>
            <div className="flex flex-col gap-1.5">
              <Eyebrow>STARTS</Eyebrow>
              <span className="text-body font-medium">{formatEventDateTime(data.start_time)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Eyebrow>ENDS</Eyebrow>
              <span className="text-body font-medium">{formatEventDateTime(data.end_time)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Eyebrow>{timing.countdownLabel}</Eyebrow>
              <span className="font-orbitron text-lg font-bold text-ov-teal">{timing.countdown}</span>
            </div>
          </StatStrip>
          {data.description && (
            <p className="max-w-[620px] font-body text-base leading-relaxed text-pretty text-ov-text">{data.description}</p>
          )}
          {(data.live_stream_url || calendarUrl) && (
            <div className="flex flex-wrap gap-3">
              {data.live_stream_url && (
                <Button asChild size="lg" variant={timing.state === "live" ? "live" : "secondary"} icon="play">
                  <a href={data.live_stream_url} target="_blank" rel="noreferrer">
                    {timing.state === "past" ? "Watch replay" : timing.state === "live" ? "Watch live" : "Stream page"}
                  </a>
                </Button>
              )}
              {calendarUrl && (
                <Button asChild size="lg" variant="secondary" icon="calendar-add">
                  <a href={calendarUrl} target="_blank" rel="noreferrer">
                    Add to calendar
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {games.length > 0 && (
        <section className="flex flex-col gap-5" aria-label="Featured games">
          <SectionHeader title="Featured games" />
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {games.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
