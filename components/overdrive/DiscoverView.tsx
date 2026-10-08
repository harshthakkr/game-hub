"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useCollection } from "@/context/CollectionContext";
import type { DiscoverData, EventCardProps, GameCardProps } from "@/utils/types";
import { saleNote } from "@/utils/price";
import { formatEventDate } from "@/utils/overdrive";
import { ChipGroup, SectionHeader } from "@/components/ui";
import { HeroCarousel } from "@/components/overdrive/HeroCarousel";
import { EventCard } from "@/components/overdrive/EventCard";
import { CompactRow, DealCard, MiniCard, RankedCard, RankedRow } from "@/components/overdrive/GameCards";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { cx } from "@/utils/cx";

const CONCIERGE_PROMPTS = [
  "Games like Elden Ring",
  "Best RPGs right now",
  "What's live right now?",
  "Short games under ₹1,000",
];

function useJson<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    axios
      .get<T>(url)
      .then((res) => !cancelled && setData(res.data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [url]);
  return { data, failed };
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ov-teal hover:text-ov-teal-hover">
      {children}
    </Link>
  );
}

function ConciergePrompt() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const ask = (q: string) => q.trim() && router.push(`/ai?q=${encodeURIComponent(q.trim())}`);

  return (
    <section
      aria-labelledby="concierge-heading"
      className="ov-chamfer grid grid-cols-[minmax(0,1fr)] items-center gap-4 border border-ov-teal-deep bg-ov-panel px-4 py-4.5 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-7"
    >
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2 font-hud text-label tracking-[0.1em] text-ov-teal">
          <OvIcon name="sparkles" className="text-sm" />
          AI CONCIERGE
        </span>
        <h2 id="concierge-heading" className="text-section font-semibold tracking-[-0.01em]">
          Not sure what to play next?
        </h2>
        <p className="hidden text-body leading-normal text-ov-dim lg:block">
          Describe a mood, a budget or a game you loved, and get picks from the catalogue.
        </p>
      </div>
      <div className="flex flex-col gap-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(query);
          }}
          className="flex h-14 items-center gap-3 border border-ov-border-strong bg-ov-field pr-2 pl-4.5 focus-within:border-ov-teal"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Co-op games under ₹2,000 for this weekend"
            aria-label="Ask the Concierge"
            className="min-w-0 flex-1 bg-transparent text-base text-ov-white outline-none"
          />
          <button
            type="submit"
            aria-label="Ask"
            disabled={!query.trim()}
            className="ov-chamfer ov-chamfer-sm flex size-10 shrink-0 items-center justify-center bg-ov-teal text-ov-teal-ink transition-colors hover:bg-ov-teal-hover disabled:opacity-40"
          >
            <OvIcon name="arrow-up" className="text-lg" />
          </button>
        </form>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
          {CONCIERGE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => ask(prompt)}
              className="h-11 shrink-0 border border-ov-border bg-ov-raised px-3 text-sm whitespace-nowrap text-ov-text transition-colors duration-150 hover:border-ov-border-strong hover:text-ov-white lg:h-auto lg:py-1.5"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/// Six-up shelves: 3 columns on narrow desktops/tablet portrait, 6 once each
/// cover can stay ~130px+, so six games always fill whole rows.
const GRID = "grid grid-cols-2 gap-5 md:grid-cols-3 min-[940px]:grid-cols-6";
/// Phones: a sideways snap scroller bleeding to the screen edges. Desktop: a grid.
const SHELF = "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:snap-none lg:gap-5 lg:overflow-visible lg:px-0";

/// Discover. The hero/trending/releases data is server-rendered and passed
/// in (so the hero art is in the first HTML); events, deals and the
/// wishlist shelf load on the client.
export function DiscoverView({ initial }: { initial: DiscoverData | null }) {
  const discover = { data: initial, failed: initial === null };
  const events = useJson<EventCardProps[]>("/api/events?upcoming=1");
  const deals = useJson<GameCardProps[]>("/api/deals");
  const { wishlist, signedIn, ready } = useCollection();
  const wishIds = wishlist.slice(0, 4).join(",");
  const wished = useJson<GameCardProps[]>(signedIn && wishIds ? `/api/games?ids=${wishIds}` : null);
  const [trendBy, setTrendBy] = useState<"hype" | "rating">("hype");

  const data = discover.data;
  const trending = data?.trending[trendBy] ?? [];
  const showWishlist = ready && signedIn && (wished.data?.length ?? 0) > 0;

  return (
    <div className="animate-ov-fade-up">
      <h1 className="sr-only">Discover games</h1>
      {data && <HeroCarousel games={data.hero} />}

      <div className="mx-auto flex max-w-[1440px] flex-col gap-9 px-4 pt-6 pb-16 md:px-8 lg:gap-16 lg:pb-24">
        {discover.failed && (
          <p role="alert" className="border border-ov-rose-deep bg-ov-rose-wash px-4 py-3 text-sm text-ov-rose-soft">
            Couldn&apos;t load Discover right now. Refresh to try again.
          </p>
        )}

        {(events.data?.length ?? 0) > 0 && (
          <section className="flex flex-col gap-5" aria-label="Live and upcoming events">
            <SectionHeader
              index="01"
              title="Live & upcoming events"
              action={<SectionLink href="/events">All<span className="hidden lg:inline"> events</span></SectionLink>}
            />
            <div className={`${SHELF} lg:grid-cols-2 xl:grid-cols-4`}>
              {events.data!.slice(0, 4).map((event) => (
                <div key={event.id} className="w-[272px] shrink-0 snap-start lg:w-auto">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </section>
        )}

        <ConciergePrompt />

        <section className="flex flex-col gap-5" aria-label="Price drops">
          <SectionHeader index="02" title="Price drops" meta="Popular games on PS Store and Steam · checked daily" />
          {deals.data && deals.data.length > 0 ? (
            <div className={`${SHELF} lg:grid-cols-3 min-[940px]:grid-cols-6`}>
              {deals.data.slice(0, 6).map((game) => (
                <div key={game.id} className="w-[140px] shrink-0 snap-start lg:w-auto">
                  <DealCard game={game} />
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-ov-border-strong px-6 py-8 text-center text-sm text-ov-dim">
              {deals.failed
                ? "Couldn't load price drops right now."
                : deals.data
                  ? "None of the games we track are on sale right now. Wishlist a game to start tracking its price."
                  : "Checking prices…"}
            </p>
          )}
        </section>

        {data && (
          <section className="flex flex-col gap-5" aria-label="Trending">
            <SectionHeader
              index="03"
              title="Trending"
              action={
                <ChipGroup
                  label="Rank trending games by"
                  variant="segmented"
                  value={trendBy}
                  onValueChange={setTrendBy}
                  options={[
                    { value: "hype", label: "By hype" },
                    { value: "rating", label: "By rating" },
                  ]}
                />
              }
            />
            <div className="hidden lg:block">
              <div className={GRID}>
                {trending.slice(0, 6).map((game, i) => (
                  <RankedCard key={game.id} game={game} rank={i + 1} />
                ))}
              </div>
            </div>
            <div className="-mt-2 lg:hidden">
              {trending.slice(0, 5).map((game, i) => (
                <RankedRow key={game.id} game={game} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {data && (
          // Two columns only when there's a wishlist panel to pair with, and
          // only once each half is wide enough for the release rows.
          <div className={cx("grid gap-10", showWishlist && "xl:grid-cols-2")}>
            <section className="flex min-w-0 flex-col gap-5" aria-label="New releases">
              <SectionHeader
                index="04"
                title="New releases"
                action={<SectionLink href="/games?sort=date">Catalogue</SectionLink>}
              />
              <div>
                {data.releases.slice(0, 5).map((game) => (
                  <CompactRow
                    key={game.id}
                    game={game}
                    meta={[
                      game.involved_companies?.find((c) => c.developer)?.company.name,
                      game.first_release_date ? formatEventDate(game.first_release_date) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ))}
              </div>
            </section>

            {showWishlist && (
              <section className="flex min-w-0 flex-col gap-5" aria-label="From your wishlist">
                <SectionHeader
                  index="05"
                  title="From your wishlist"
                  action={<SectionLink href="/wishlist">Wishlist · {wishlist.length}</SectionLink>}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  {wished.data!.map((game) => {
                    const note = saleNote(game.price);
                    return (
                      <MiniCard
                        key={game.id}
                        game={game}
                        note={note ?? (game.price ? "Tracking · no change" : null)}
                        noteTone={note ? "deal" : "muted"}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
