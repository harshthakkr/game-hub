"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import type { GameCardProps, GamePageProps, ReviewsResponse } from "@/utils/types";
import { SHELVES, useCollection } from "@/context/CollectionContext";
import { useIsMobile } from "@/utils/hooks/useMediaQuery";
import { useScreenTitle } from "@/components/overdrive/ScreenTitle";
import { verdictMeta, verdictVars } from "@/utils/reviews";
import {
  coverUrl,
  developerName,
  formatYear,
  igdbImage,
  landscapeArt,
} from "@/utils/overdrive";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { GameGridCard, useWishToggle } from "@/components/overdrive/GameCards";
import { Lightbox } from "@/components/overdrive/Lightbox";
import { ShelfMenu, ShelfSheet } from "@/components/overdrive/ShelfMenu";
import { TrailerDialog } from "@/components/overdrive/TrailerDialog";
import { WhereToBuy } from "@/components/overdrive/WhereToBuy";
import { ReviewsPanel } from "@/components/overdrive/reviews/ReviewsPanel";
import { VerdictPips } from "@/components/overdrive/reviews/VerdictPips";
import {
  Button,
  Eyebrow,
  StatStrip,
  SubHeading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
} from "@/components/ui";
import { cx } from "@/utils/cx";
import { heroPending, useHeroArrival } from "@/utils/heroNav";

/// Review totals for the hero's "Players say" stat and the tab count.
function useReviewStats(gameId?: number) {
  const [stats, setStats] = useState<ReviewsResponse["stats"] | null>(null);
  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    axios
      .get<ReviewsResponse>("/api/reviews", { params: { gameId, page: 1 } })
      .then((res) => !cancelled && setStats(res.data.stats))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [gameId]);
  return stats;
}

/// Ten-segment bar under the critic score: one lit segment per 10 points.
function ScoreTicks({ score }: { score: number }) {
  return (
    <span aria-hidden className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={cx("h-1 w-2", i < Math.round(score / 10) ? "bg-ov-teal" : "bg-ov-border-strong")}
        />
      ))}
    </span>
  );
}

function FactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 border-b border-ov-raised py-3 text-sm last:border-b-0">
      <dt className="pt-0.5 text-ov-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/// Game detail screen. Data arrives server-rendered from the page, so the
/// hero and its art are in the first HTML response (no client fetch, no
/// skeleton flash).
export function GameView({ data, slug }: { data: GamePageProps; slug: string }) {
  const { shelfOf } = useCollection();
  const { wished, popClass, toggle: toggleWished } = useWishToggle(data.id);
  const stats = useReviewStats(data?.id);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [shelfSheet, setShelfSheet] = useState(false);
  const isMobile = useIsMobile();
  useScreenTitle(data?.name);
  // Arriving from a card: the hero transition (or its skeleton) already put
  // the cover and title in place, so skip the page fade-in.
  const [arrivedByHero] = useState(() => heroPending(slug) !== null);
  useHeroArrival(slug, true);

  const cover = coverUrl(data.cover);
  const art = landscapeArt(data.artworks, data.screenshots);
  const shots = data.screenshots ?? [];
  const fullShots = shots.map((shot) => igdbImage(shot.url, "t_1080p"));
  const trailer = data.videos?.[0]?.video_id;
  const score = data.aggregated_rating ? Math.round(data.aggregated_rating) : null;
  const consensus = stats?.consensus ? verdictMeta(stats.consensus) : null;
  const consensusShare =
    stats?.consensus && stats.total ? Math.round((stats.counts[stats.consensus] / stats.total) * 100) : 0;
  const developer = developerName(data.involved_companies);
  const related: GameCardProps[] = (data.similar_games ?? []).filter((g) => g.cover).slice(0, 10);
  const unreleased = !!data.first_release_date && data.first_release_date * 1000 > Date.now();
  const shelf = data.id ? shelfOf(data.id) : null;
  const where = <WhereToBuy slug={String(slug)} gameName={data.name} stores={data.stores ?? []} />;
  const facts = (
    <dl
      className={cx(
        "flex flex-col",
        !isMobile && "ov-chamfer border border-ov-border bg-ov-panel px-5.5 pt-2 pb-4"
      )}
    >
      <FactRow label="Release">
        {data.release_dates?.[0]?.human || formatYear(data.first_release_date) || "TBA"}
      </FactRow>
      {developer && <FactRow label="Developer">{developer}</FactRow>}
      {data.platforms?.length ? (
        <FactRow label="Platforms">
          <span className="flex flex-wrap gap-1.5">
            {data.platforms.map((p) => (
              <Tag key={p.name} size="sm">
                {p.name}
              </Tag>
            ))}
          </span>
        </FactRow>
      ) : null}
      {data.genres?.length ? (
        <FactRow label="Genres">
          <span className="flex flex-wrap gap-1.5">
            {data.genres.map((g) => (
              <Tag key={g.name} size="sm">
                {g.name}
              </Tag>
            ))}
          </span>
        </FactRow>
      ) : null}
    </dl>
  );

  return (
    <div
      data-vt-hero={slug}
      // The cover's own hue lights the hero; falls back to the brand teal.
      style={{ "--game-accent": data.accent ?? "var(--color-ov-teal)" } as React.CSSProperties}
      className={cx("pb-24 lg:pb-0", !arrivedByHero && "animate-ov-fade-up")}
    >
      {/* Phone hero: art band, then the title block and a 3-up stat grid. */}
      <section className="lg:hidden">
        <div data-vt="cover" className="relative h-[236px] overflow-hidden bg-ov-panel md:h-[340px]">
          {art ? (
            <>
              {/* Blurred cover under the art: fills the band while the art
                  loads (the card already cached this size). */}
              {cover && (
                <Image src={cover} alt="" fill sizes="132px" className="scale-110 object-cover opacity-40 blur-2xl" />
              )}
              <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
            </>
          ) : (
            cover && (
              <>
                <Image src={cover} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-40 blur-2xl" />
                <span className="ov-chamfer absolute top-5 left-4 h-[176px] w-[132px] overflow-hidden shadow-[0_16px_32px_rgb(0_0_0/0.6)]">
                  <Image src={cover} alt={`${data.name} cover art`} fill sizes="132px" className="object-cover" />
                </span>
              </>
            )
          )}
          <div className="absolute inset-0 bg-linear-to-t from-ov-bg from-2% to-transparent to-55%" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_100%,color-mix(in_oklch,var(--game-accent)_22%,transparent),transparent_60%)]" />
        </div>
        <div className="relative -mt-5 flex flex-col gap-3 px-4">
          <div className="flex flex-wrap gap-1.5">
            {(data.genres ?? []).slice(0, 2).map((g) => (
              <Tag key={g.name} size="sm">
                {g.name}
              </Tag>
            ))}
            {unreleased && (
              <Tag tone="teal" size="sm">
                Unreleased
              </Tag>
            )}
          </div>
          <h1
            data-vt="title"
            className={cx(
              "leading-[1.1] font-semibold tracking-[-0.025em] text-balance",
              data.name.length > 40 ? "text-[22px]" : "text-[28px]"
            )}
          >
            {data.name}
          </h1>
          <p className="text-sm text-ov-dim">
            {[developer, data.release_dates?.[0]?.human || formatYear(data.first_release_date) || "TBA"]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="grid grid-cols-3 border border-ov-border bg-ov-panel [&>*]:flex [&>*]:min-w-0 [&>*]:flex-col [&>*]:gap-1.5 [&>*]:px-3 [&>*]:py-2.5 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-ov-border">
            <div>
              <Eyebrow>CRITIC</Eyebrow>
              <span className="flex items-baseline gap-0.5">
                <span
                  className={cx(
                    "font-orbitron text-2xl leading-none font-extrabold",
                    score === null ? "text-ov-muted" : score >= 75 ? "text-ov-teal" : "text-ov-dim"
                  )}
                >
                  {score ?? "TBA"}
                </span>
                {score !== null && <span className="font-orbitron text-micro text-ov-muted">/100</span>}
              </span>
              <span className="text-label text-ov-muted">{score === null ? "Not rated yet" : "Critic score"}</span>
            </div>
            <div style={consensus ? verdictVars(consensus.color) : undefined}>
              <Eyebrow>PLAYERS SAY</Eyebrow>
              <VerdictPips verdict={stats?.consensus ?? null} />
              <span className={cx("truncate text-ui font-semibold", consensus ? "text-(--verdict)" : "text-ov-dim")}>
                {consensus?.label ?? (unreleased ? "Not out yet" : "No verdicts")}
              </span>
            </div>
            <div>
              <Eyebrow>HYPE</Eyebrow>
              <span className="font-orbitron text-2xl leading-none font-bold">{data.hypes ?? "—"}</span>
              <span className="text-label text-ov-muted">hypes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop hero. Landscape art only; a portrait cover blown up to banner width
          looks soft, so games without it get a quiet gradient instead. */}
      <section className="relative hidden min-h-[540px] overflow-hidden lg:flex">
        {art ? (
          <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgb(45_212_191/0.12),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-ov-bg/95 via-ov-bg/78 via-45% to-ov-bg/35" />
        <div className="absolute inset-0 bg-linear-to-t from-ov-bg from-4% via-ov-bg/60 via-40% to-ov-bg/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_90%,color-mix(in_oklch,var(--game-accent)_20%,transparent),transparent_50%)]" />

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 px-4 pt-6 pb-10 md:px-8">
          <Button asChild variant="outline" size="sm" icon="chevron-left" className="w-max bg-ov-bg/60">
            <Link href="/games">Catalogue</Link>
          </Button>

          <div className="flex flex-wrap items-end gap-8">
            {cover && (
              // drop-shadow on a wrapper: it follows the chamfer, which clips box-shadow.
              <div className="hidden shrink-0 drop-shadow-[0_20px_40px_color-mix(in_oklch,var(--game-accent)_40%,transparent)] md:block">
                <div data-vt="cover" className="ov-chamfer relative h-[267px] w-[200px] overflow-hidden border border-[color-mix(in_oklch,var(--game-accent)_35%,var(--color-ov-border-strong))]">
                  <Image src={cover} alt={`${data.name} cover art`} fill sizes="200px" className="object-cover" />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
              {data.genres?.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.genres.slice(0, 3).map((g) => (
                    <Tag key={g.name}>{g.name}</Tag>
                  ))}
                </div>
              ) : null}
              <h1 data-vt="title" className="text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance [text-shadow:0_2px_24px_rgb(0_0_0/0.5)] md:text-display">
                {data.name}
              </h1>
              <p className="text-base text-ov-text">
                {[developer, formatYear(data.first_release_date) || "TBA"].filter(Boolean).join(" · ")}
              </p>
              <div className="flex flex-wrap gap-3 pt-1.5">
                {trailer && (
                  <Button variant="primary" size="lg" icon="play" onClick={() => setTrailerOpen(true)}>
                    Trailer
                  </Button>
                )}
                {data.id && (
                  <>
                    <Button
                      size="lg"
                      variant={wished ? "danger" : "secondary"}
                      icon={wished ? "heart-filled" : "heart"}
                      aria-pressed={wished}
                      className={popClass}
                      onClick={toggleWished}
                    >
                      {wished ? "Wishlisted" : "Wishlist"}
                    </Button>
                    <ShelfMenu gameId={data.id} gameName={data.name} size="lg" />
                  </>
                )}
              </div>
            </div>

            <StatStrip className="bg-[rgb(10_14_24/0.88)] [&>*]:px-5.5 [&>*]:py-4">
              <div className="flex flex-col gap-1.5">
                <Eyebrow>CRITIC</Eyebrow>
                <span className="flex items-baseline gap-1">
                  <span
                    className={cx(
                      "font-orbitron text-[40px] leading-none font-extrabold",
                      score === null ? "text-ov-muted" : score >= 75 ? "text-ov-teal" : "text-ov-dim"
                    )}
                  >
                    {score ?? "TBA"}
                  </span>
                  {score !== null && <span className="font-orbitron text-ui text-ov-muted">/100</span>}
                </span>
                {score !== null && <ScoreTicks score={score} />}
              </div>
              <div className="flex flex-col gap-2">
                <Eyebrow>PLAYERS SAY</Eyebrow>
                {consensus ? (
                  <>
                    <span
                      className="flex items-center gap-2 text-base font-semibold text-(--verdict)"
                      style={verdictVars(consensus.color)}
                    >
                      <VerdictPips verdict={stats!.consensus} />
                      {consensus.label}
                    </span>
                    <span className="text-ui text-ov-dim">
                      {consensusShare}% of {stats!.total.toLocaleString("en-IN")}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-ov-dim">No reviews yet</span>
                )}
              </div>
              {data.hypes ? (
                <div className="flex flex-col gap-1.5">
                  <Eyebrow>HYPE</Eyebrow>
                  <span className="font-orbitron text-[26px] leading-tight font-bold">{data.hypes}</span>
                  <span className="text-ui text-ov-dim">hypes on IGDB</span>
                </div>
              ) : null}
            </StatStrip>
          </div>
        </div>
      </section>

      <Tabs defaultValue="overview">
        <div className="sticky top-(--ov-topbar-h) z-20 mt-4 border-b border-ov-border bg-ov-bg/94 backdrop-blur-[14px] lg:static lg:mt-0 lg:bg-transparent lg:backdrop-blur-none">
          <TabsList fill className="mx-auto max-w-[1440px] lg:px-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews
              {stats?.total ? (
                <span className="bg-ov-raised px-1.5 font-hud text-label text-ov-dim">{stats.total}</span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop: content + sidebar as a grid, so "Where to buy" stays beside
            the content on narrow desktops/tablets instead of wrapping below it. */}
        <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 pt-5 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,300px)] lg:items-start lg:gap-8 lg:px-8 lg:pt-10 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:gap-14">
          <div className="flex min-w-0 flex-col">
            <TabsContent value="overview" className="flex flex-col gap-8 lg:gap-12">
              {isMobile && where}
              <section className="flex flex-col gap-3.5">
                <SubHeading>About</SubHeading>
                <p className="max-w-[720px] font-body text-body leading-relaxed text-pretty text-ov-text lg:text-lead">
                  {data.summary || data.storyline || "No description yet."}
                </p>
              </section>

              {(trailer || shots.length > 0) && (
                <section className="flex flex-col gap-3.5">
                  <SubHeading>{trailer ? "Trailer & screenshots" : "Screenshots"}</SubHeading>
                  {/* Phones: a sideways snap scroller. Desktop: trailer plus a 2x2 grid. */}
                  <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-[150px_150px] lg:gap-3 lg:px-0">
                    {trailer && (
                      <button
                        type="button"
                        onClick={() => setTrailerOpen(true)}
                        className="ov-chamfer group h-[169px] w-[300px] shrink-0 snap-start overflow-hidden bg-ov-raised lg:row-span-2 lg:h-auto lg:w-auto"
                      >
                        {(art ?? fullShots[0]) && (
                          <Image src={(art ?? fullShots[0])!} alt="" fill sizes="(min-width: 586px) 50vw, 100vw" className="object-cover" />
                        )}
                        <span className="absolute inset-0 bg-ov-bg/40 transition-colors group-hover:bg-ov-bg/25" />
                        <span className="absolute bottom-5 left-5 flex items-center gap-3">
                          <span className="ov-chamfer ov-chamfer-sm flex size-[52px] items-center justify-center bg-ov-teal text-ov-teal-ink">
                            <OvIcon name="play" className="text-xl" />
                          </span>
                          <span className="text-body font-semibold">Watch trailer</span>
                        </span>
                      </button>
                    )}
                    {shots.slice(0, trailer ? 4 : 6).map((shot, i) => (
                      <button
                        key={shot.url}
                        type="button"
                        onClick={() => setLightbox({ open: true, index: i })}
                        aria-label={`Open screenshot ${i + 1} of ${shots.length}`}
                        className="group relative h-[169px] w-[300px] shrink-0 snap-start overflow-hidden border border-ov-border transition-colors duration-150 hover:border-ov-border-strong lg:h-auto lg:w-auto"
                      >
                        <Image
                          src={igdbImage(shot.url, "t_screenshot_big")}
                          alt=""
                          fill
                          sizes="(min-width: 800px) 25vw, 300px"
                          className="object-cover transition-[filter] duration-200 group-hover:brightness-110"
                        />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {related.length > 0 && (
                <section className="flex flex-col gap-3.5">
                  <SubHeading>Similar games</SubHeading>
                  {/* Fixed column counts, each showing a whole number of rows:
                      3 cols × 3 rows, 4 × 2, 5 × 2. No lone card on the last row. */}
                  <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:px-0 xl:grid-cols-4 2xl:grid-cols-5">
                    {related.map((game, i) => (
                      <div
                        key={game.id}
                        className={cx(
                          "w-[132px] shrink-0 snap-start lg:w-auto",
                          i === 8 && "xl:hidden 2xl:block",
                          i === 9 && "lg:hidden 2xl:block"
                        )}
                      >
                        <GameGridCard game={game} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {isMobile && facts}
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsPanel gameId={data.id} gameSlug={String(slug)} gameName={data.name} />
            </TabsContent>
          </div>

          {!isMobile && (
            <aside aria-label="Game details" className="flex min-w-0 flex-col gap-5">
              {where}
              {facts}
            </aside>
          )}
        </div>
      </Tabs>

      {/* Phones: the tab bar gives way to the game's own actions. */}
      {data.id && (
        <div
          className={cx(
            "fixed inset-x-0 bottom-0 z-40 mx-auto grid max-w-[480px] gap-2 border-t border-ov-border bg-ov-bg/96 px-4 pt-2.5 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[14px] lg:hidden",
            trailer ? "grid-cols-3" : "grid-cols-2"
          )}
        >
          {trailer && (
            <Button variant="primary" size="lg" icon="play" className="px-2" onClick={() => setTrailerOpen(true)}>
              Trailer
            </Button>
          )}
          <Button
            size="lg"
            variant={wished ? "danger" : "secondary"}
            icon={wished ? "heart-filled" : "heart"}
            aria-pressed={wished}
            chamfer={false}
            className={popClass}
            onClick={toggleWished}
          >
            {wished ? "Saved" : "Wishlist"}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            aria-pressed={!!shelf}
            iconRight="chevron-down"
            chamfer={false}
            onClick={() => setShelfSheet(true)}
          >
            {shelf ? SHELVES.find((x) => x.value === shelf)!.label : "Library"}
          </Button>
          <ShelfSheet gameId={data.id} gameName={data.name} open={shelfSheet} onOpenChange={setShelfSheet} />
        </div>
      )}

      {trailer && (
        <TrailerDialog videoId={trailer} title={data.name} open={trailerOpen} onOpenChange={setTrailerOpen} />
      )}
      <Lightbox
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((prev) => ({ ...prev, open }))}
        images={fullShots}
        index={lightbox.index}
        alt={data.name}
        onNavigate={(index) => setLightbox((prev) => ({ ...prev, index }))}
      />
    </div>
  );
}
