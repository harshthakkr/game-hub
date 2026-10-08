import Image from "next/image";
import Link from "next/link";
import type { EventCardProps } from "@/utils/types";
import { eventTiming, googleCalendarUrl, igdbImage } from "@/utils/overdrive";
import { Eyebrow } from "@/components/ui";
import { cx } from "@/utils/cx";
import { OvIcon } from "./OvIcon";

/// Event tile: logo art with a status badge, title, a countdown and one
/// action (watch when live, add to calendar when upcoming). The title link
/// stretches over the card; the action stays a separate, focusable sibling.
export function EventCard({ event, showStart = false }: { event: EventCardProps; showStart?: boolean }) {
  const timing = eventTiming(event.start_time, event.end_time);
  const logo = event.event_logo?.url ? igdbImage(event.event_logo.url, "t_1080p") : null;
  const live = timing.state === "live";

  return (
    <div className="ov-chamfer group flex flex-col border border-ov-border bg-ov-panel transition-colors duration-150 hover:border-ov-border-strong has-[a:focus-visible]:border-ov-teal">
      <div className="relative h-[150px] overflow-hidden bg-ov-raised">
        {logo && (
          <Image src={logo} alt="" fill sizes="(min-width: 1080px) 320px, 90vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ov-panel/90 to-transparent to-60%" />
        <span
          className={cx(
            "absolute top-3 left-3 flex items-center gap-1.5 border px-2 py-0.5 text-label font-semibold",
            live
              ? "border-ov-rose-strong bg-ov-rose-strong text-white"
              : "border-ov-border-strong bg-ov-bg/82 text-ov-white",
            timing.state === "past" && "text-ov-dim"
          )}
        >
          {live && <span aria-hidden className="size-1.5 animate-ov-pulse rounded-full bg-white" />}
          {timing.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 pb-[18px]">
        <Link
          href={`/events/${event.slug}`}
          className="min-h-[42px] text-base font-semibold leading-snug text-ov-white outline-none before:absolute before:inset-0"
        >
          {event.name}
        </Link>
        {showStart && event.start_time && (
          <span className="-mt-1.5 text-ui text-ov-dim">
            {new Date(event.start_time * 1000).toLocaleString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
        <div className="mt-auto flex items-end justify-between gap-2.5">
          <div className="flex flex-col gap-1">
            <Eyebrow>{timing.countdownLabel}</Eyebrow>
            <span className="font-orbitron text-lg font-bold text-ov-white">{timing.countdown}</span>
          </div>
          {timing.state === "upcoming" && event.start_time && (
            <a
              href={googleCalendarUrl({
                title: event.name,
                start: event.start_time,
                end: event.end_time,
                details: event.description,
              })}
              target="_blank"
              rel="noreferrer"
              aria-label={`Add to calendar: ${event.name} (Google Calendar)`}
              className="relative z-10 flex h-[34px] items-center gap-1.5 border border-ov-border-strong px-3 text-ui font-medium whitespace-nowrap text-ov-text transition-colors duration-150 hover:bg-ov-raised hover:text-ov-white"
            >
              <OvIcon name="calendar-add" className="text-sm" />
              Add to calendar
            </a>
          )}
          {live && (
            <span className="flex h-[34px] items-center border border-ov-rose px-3 text-ui font-medium text-ov-rose-soft">
              Watch live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
