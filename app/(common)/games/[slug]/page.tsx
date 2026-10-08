"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSingleData } from "@/utils/hooks/useSingleData";
import type { GameCardProps, GamePageProps, ReviewsResponse } from "@/utils/types";
import { useCollection } from "@/context/CollectionContext";
import { verdictMeta, verdictVars } from "@/utils/reviews";
import {
  coverUrl,
  developerName,
  formatYear,
  igdbImage,
  landscapeArt,
} from "@/utils/overdrive";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { GameDetailSkeleton } from "@/components/overdrive/Skeletons";
import { Lightbox } from "@/components/overdrive/Lightbox";
import { ShelfMenu } from "@/components/overdrive/ShelfMenu";
import { TrailerDialog } from "@/components/overdrive/TrailerDialog";
import { WhereToBuy } from "@/components/overdrive/WhereToBuy";
import { ReviewsPanel } from "@/components/overdrive/reviews/ReviewsPanel";
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

export default function GamePage() {
  const { data, loading } = useSingleData<GamePageProps>("games");
  const { slug } = useParams<{ slug: string }>();
  const { isWished, toggleWish } = useCollection();
  const stats = useReviewStats(data?.id);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [trailerOpen, setTrailerOpen] = useState(false);

  if (loading) return <GameDetailSkeleton />;
  if (!data) {
    return (
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="text-lg font-semibold">We couldn&apos;t find that game</p>
        <Button asChild variant="secondary">
          <Link href="/games">Back to the catalogue</Link>
        </Button>
      </div>
    );
  }

  const cover = coverUrl(data.cover);
  const art = landscapeArt(data.artworks) ?? landscapeArt(data.screenshots);
  const shots = data.screenshots ?? [];
  const fullShots = shots.map((shot) => igdbImage(shot.url, "t_1080p"));
  const wished = data.id ? isWished(data.id) : false;
  const trailer = data.videos?.[0]?.video_id;
  const score = data.aggregated_rating ? Math.round(data.aggregated_rating) : null;
  const consensus = stats?.consensus ? verdictMeta(stats.consensus) : null;
  const consensusShare =
    stats?.consensus && stats.total ? Math.round((stats.counts[stats.consensus] / stats.total) * 100) : 0;
  const developer = developerName(data.involved_companies);
  const related: GameCardProps[] = (data.similar_games ?? []).filter((g) => g.cover).slice(0, 10);

  return (
    <div className="animate-ov-fade-up">
      {/* Hero. Landscape art only; a portrait cover blown up to banner width
          looks soft, so games without it get a quiet gradient instead. */}
      <section className="relative flex min-h-[540px] overflow-hidden">
        {art ? (
          <Image src={art} alt="" fill priority sizes="100vw" className="object-cover object-[50%_30%]" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgb(45_212_191/0.12),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-ov-bg/95 via-ov-bg/78 via-45% to-ov-bg/35" />
        <div className="absolute inset-0 bg-linear-to-t from-ov-bg from-4% via-ov-bg/60 via-40% to-ov-bg/10" />

        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 px-4 pt-6 pb-10 md:px-8">
          <Button asChild variant="outline" size="sm" icon="chevron-left" className="w-max bg-ov-bg/60">
            <Link href="/games">Catalogue</Link>
          </Button>

          <div className="flex flex-wrap items-end gap-8">
            {cover && (
              <div className="ov-chamfer relative hidden h-[267px] w-[200px] shrink-0 overflow-hidden border border-ov-border-strong md:block">
                <Image src={cover} alt={`${data.name} cover art`} fill sizes="200px" className="object-cover" />
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
              <h1 className="text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance [text-shadow:0_2px_24px_rgb(0_0_0/0.5)] md:text-display">
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
                      onClick={() => toggleWish(data.id!)}
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
                      <span aria-hidden className="size-2 rotate-45 bg-(--verdict)" />
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
        <div className="border-b border-ov-border">
          <TabsList className="mx-auto max-w-[1440px] px-4 md:px-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews
              {stats?.total ? (
                <span className="bg-ov-raised px-1.5 font-mono text-label text-ov-dim">{stats.total}</span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mx-auto flex max-w-[1440px] flex-wrap items-start gap-14 px-4 pt-10 pb-24 md:px-8">
          <div className="flex min-w-0 flex-[999_1_560px] flex-col">
            <TabsContent value="overview" className="flex flex-col gap-12">
              <section className="flex flex-col gap-3.5">
                <SubHeading>About</SubHeading>
                <p className="max-w-[720px] text-lead leading-relaxed text-pretty text-ov-text">
                  {data.summary || data.storyline || "No description yet."}
                </p>
              </section>

              {(trailer || shots.length > 0) && (
                <section className="flex flex-col gap-3.5">
                  <SubHeading>{trailer ? "Trailer & screenshots" : "Screenshots"}</SubHeading>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-[2fr_1fr_1fr] md:grid-rows-[150px_150px]">
                    {trailer && (
                      <button
                        type="button"
                        onClick={() => setTrailerOpen(true)}
                        className="ov-chamfer group col-span-2 aspect-video overflow-hidden bg-ov-raised md:col-span-1 md:row-span-2 md:aspect-auto"
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
                        className="group relative aspect-video overflow-hidden border border-ov-border transition-colors duration-150 hover:border-ov-border-strong md:aspect-auto"
                      >
                        <Image
                          src={igdbImage(shot.url, "t_screenshot_big")}
                          alt=""
                          fill
                          sizes="(min-width: 586px) 25vw, 50vw"
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
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
                    {related.map((game) => (
                      <GameGridCard key={game.id} game={game} />
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsPanel gameId={data.id} gameSlug={String(slug)} gameName={data.name} />
            </TabsContent>
          </div>

          <aside aria-label="Game details" className="flex min-w-0 flex-[1_1_320px] flex-col gap-5 lg:max-w-[420px]">
            <WhereToBuy slug={String(slug)} gameName={data.name} stores={data.stores ?? []} />
            <dl className="ov-chamfer flex flex-col border border-ov-border bg-ov-panel px-5.5 pt-2 pb-4">
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
          </aside>
        </div>
      </Tabs>

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
