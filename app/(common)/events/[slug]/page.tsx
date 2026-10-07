"use client";

import Link from "next/link";
import Image from "next/image";
import { useSingleData } from "@/utils/hooks/useSingleData";
import { EventPageProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { EventDetailSkeleton } from "@/components/overdrive/Skeletons";
import {
  eventStatus,
  formatEventDateTime,
  googleCalendarUrl,
  isUpcoming,
} from "@/utils/overdrive";

export default function Event() {
  const { data, loading } = useSingleData<EventPageProps>("events");

  if (loading) return <EventDetailSkeleton />;
  if (!data) {
    return (
      <div className="px-8 py-20 text-center text-ov-muted">Event not found.</div>
    );
  }

  const logo = data.event_logo?.url
    ? `https:${data.event_logo.url.replace("t_thumb", "t_1080p")}`
    : null;
  const status = eventStatus(data.start_time, data.end_time);
  const games = (data.games || []).filter((g) => g.cover).slice(0, 8);
  const upcoming = isUpcoming(data.start_time);
  const calendarUrl =
    upcoming && data.start_time
      ? googleCalendarUrl({
          title: data.name || "Gaming event",
          start: data.start_time,
          end: data.end_time,
          details: [data.description, data.live_stream_url]
            .filter(Boolean)
            .join("\n\n"),
          location: data.live_stream_url,
        })
      : null;

  return (
    <PageContainer>
      <Link
        href="/events"
        className="mb-5 inline-flex items-center border border-ov-teal px-3.5 py-2 text-xs tracking-wide text-ov-teal transition-colors duration-150 hover:bg-ov-teal hover:text-ov-bg active:scale-95"
      >
        <OvIcon name="chevron-left" className="mr-1 text-xs" />
        BACK TO EVENTS
      </Link>

      <div className="flex flex-wrap gap-7">
        <div className="max-w-[440px] min-w-[280px] flex-1">
          <div className="ov-chamfer ov-chamfer-lg relative h-[240px] overflow-hidden border border-ov-border bg-linear-to-br from-sky-700 to-slate-950">
            {logo && (
              <Image src={logo} alt="" fill className="object-cover" sizes="440px" />
            )}
            <span className="absolute left-3 top-3 bg-ov-teal px-2 py-0.5 text-micro tracking-wide text-ov-bg">
              EVENT
            </span>
          </div>
        </div>

        <div className="min-w-[280px] flex-1">
          <h1 className="font-orbitron text-3xl font-black tracking-wide text-white">
            {data.name}
          </h1>
          <div className="mt-[18px] flex flex-wrap gap-5 text-ui">
            <div>
              <div className="tracking-wide text-ov-dim">START</div>
              <div className="mt-1 text-ov-teal">
                {formatEventDateTime(data.start_time)}
              </div>
            </div>
            <div>
              <div className="tracking-wide text-ov-dim">END</div>
              <div className="mt-1 text-ov-teal">
                {formatEventDateTime(data.end_time)}
              </div>
            </div>
            <div>
              <div className="tracking-wide text-ov-dim">STATUS</div>
              <div className="mt-1 text-ov-rose">{status.label}</div>
            </div>
          </div>
          {data.description && (
            <p className="mt-5 max-w-[520px] text-body leading-relaxed text-ov-text">
              {data.description}
            </p>
          )}
          {(data.live_stream_url || calendarUrl) && (
            <div className="mt-[22px] flex flex-wrap gap-3">
              {/* Only rendered when there is somewhere to actually send the viewer. */}
              {data.live_stream_url && (
                <a
                  href={data.live_stream_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ov-chamfer-x ov-chamfer-sm flex items-center bg-ov-rose px-5 py-3 font-orbitron text-xs font-bold tracking-hud text-ov-bg transition-transform duration-150 hover:brightness-110 active:scale-95"
                >
                  <OvIcon name="play" className="mr-1.5 text-xs" />
                  WATCH STREAM
                </a>
              )}
              {/* Past events cannot be reminded about, so this is upcoming-only. */}
              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ov-chamfer-x ov-chamfer-sm flex items-center border border-ov-teal bg-ov-teal/8 px-5 py-3 text-ui tracking-hud text-ov-teal transition-colors duration-150 hover:bg-ov-teal/18 active:scale-95"
                >
                  <OvIcon name="reminder" className="mr-1.5 text-ui" />
                  ADD TO CALENDAR
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {games.length > 0 && (
        <>
          <div className="mb-4 mt-10 font-orbitron text-ui font-bold tracking-hud-wide text-ov-teal">
            FEATURED GAMES
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
            {games.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
