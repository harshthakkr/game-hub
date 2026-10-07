"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useSingleData } from "@/utils/hooks/useSingleData";
import { GamePageProps } from "@/utils/types";
import { useCollection } from "@/context/CollectionContext";
import { OvIcon } from "@/components/overdrive/OvIcon";
import {
  Button,
  Eyebrow,
  Panel,
  Price,
  SectionLabel,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
} from "@/components/ui";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { GameDetailSkeleton } from "@/components/overdrive/Skeletons";
import { Lightbox } from "@/components/overdrive/Lightbox";
import { PriceHistoryModal } from "@/components/overdrive/PriceHistoryModal";
import { ReviewsPanel } from "@/components/overdrive/reviews/ReviewsPanel";
import {
  coverUrl,
  developerName,
  formatRating,
  formatYear,
  platformAbbr,
} from "@/utils/overdrive";

function igdbImage(url: string, size: string) {
  return `https:${url.replace("t_thumb", size)}`;
}

/// One "where to buy" line: store name, optional sublabel, and a price or a
/// call to action. Renders as an external link or, for tracked listings, a
/// button that opens the price history.
function StoreRow({
  name,
  sublabel,
  trailing,
  href,
  onClick,
}: {
  name: string;
  sublabel?: string;
  trailing: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center justify-between gap-3 border border-ov-border px-3 py-2 text-left text-xs transition-[background-color,border-color,scale] duration-150 hover:border-ov-teal hover:bg-ov-teal/5 active:scale-[0.98]";
  const body = (
    <>
      <span className="flex flex-col">
        <span className="text-ov-text">{name}</span>
        {sublabel && (
          <span className="inline-flex items-center gap-0.5 text-micro tracking-wide text-ov-dim">
            {sublabel}
            <OvIcon name="chevron-right" className="text-micro" />
          </span>
        )}
      </span>
      {trailing}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function StoreAction({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-ov-dim">
      {children}
      <OvIcon name="chevron-right" className="text-xs" />
    </span>
  );
}

export default function Game() {
  const { data, loading } = useSingleData<GamePageProps>("games");
  const { isWished, isInLibrary, toggleWish, toggleLibrary } = useCollection();
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const { slug } = useParams<{ slug: string }>();

  if (loading) return <GameDetailSkeleton />;
  if (!data) {
    return (
      <div className="px-8 py-20 text-center text-ov-muted">
        No data available for this game.
      </div>
    );
  }

  const cover = coverUrl(data.cover);
  // The hero banner is wide (~4.7:1) while box art is portrait, so stretching a
  // cover into it crops away most of the artwork. Prefer IGDB's dedicated
  // artworks (landscape key art made for exactly this) or a screenshot, and
  // only fall back to the cover when a game truly has neither.
  const landscape = (list?: { url: string; width?: number; height?: number }[]) =>
    list?.find((item) => !item.width || !item.height || item.width >= item.height);
  const heroSource = landscape(data.artworks) || landscape(data.screenshots);
  const bg = heroSource ? igdbImage(heroSource.url, "t_1080p") : cover;
  const shots = data.screenshots || [];
  const fullShots = shots.map((shot) => igdbImage(shot.url, "t_1080p"));
  const wished = data.id ? isWished(data.id) : false;
  const inLib = data.id ? isInLibrary(data.id) : false;
  const trailer = data.videos?.[0]?.video_id;
  const related = (data.similar_games || [])
    .filter((g) => g.cover)
    .slice(0, 8)
    .map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      cover: g.cover,
      aggregated_rating: g.aggregated_rating,
      first_release_date: g.first_release_date,
      genres: g.genres,
      hypes: g.hypes,
    }));

  return (
    <div className="mx-auto max-w-[1320px] pb-[60px]">
      <div className="relative h-[280px] lg:h-[340px]">
        {bg && (
          <Image src={bg} alt="" fill className="object-cover" sizes="1320px" priority />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-ov-bg via-ov-bg/30 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-ov-teal)_1px,transparent_1px)] bg-size-[100%_30px] opacity-5" />
        {/* Dark backing keeps the translucent button legible over bright art. */}
        <div className="absolute left-4 top-5 z-10 bg-ov-bg/70 backdrop-blur-sm lg:left-[34px]">
          <Button asChild size="sm" variant="secondary" icon="chevron-left">
            <Link href="/games">BACK</Link>
          </Button>
        </div>
        <div className="absolute bottom-[26px] left-4 right-4 z-10 flex flex-wrap items-end gap-6 lg:left-[34px] lg:right-[34px]">
          {cover && (
            <div className="relative aspect-[3/4] w-[110px] shrink-0 lg:w-[150px]">
              <Image src={cover} alt={data.name} fill className="object-cover" sizes="150px" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {data.genres?.[0] && (
              <Tag tone="rose" className="bg-ov-bg/75 backdrop-blur-sm">
                {data.genres[0].name}
              </Tag>
            )}
            <h1 className="mt-3.5 font-orbitron text-title font-black text-white lg:text-4xl">
              {data.name}
            </h1>
            <div className="mt-2.5 text-body text-ov-text">
              {developerName(data.involved_companies)} ·{" "}
              {formatYear(data.first_release_date)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-orbitron text-4xl font-black text-ov-teal">
              {formatRating(data.aggregated_rating)}
            </div>
            <div className="text-micro tracking-hud-wide text-ov-dim">CRITIC INDEX</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-[26px] px-4 py-[26px] lg:px-6">
        {/* Overview, media and related all describe the game itself, so they
            share one tab. Reviews stay separate: long-form, paginated, and
            written as well as read. */}
        <Tabs defaultValue="overview" className="min-w-[280px] flex-1">
          <TabsList className="mb-[22px]">
            <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
            <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SectionLabel className="mb-3.5">ABOUT</SectionLabel>
            <p className="max-w-[620px] text-body leading-[1.9] text-ov-text">
              {data.summary || data.storyline || "No summary available."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {trailer && (
                <Button asChild variant="primary" icon="play">
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    TRAILER
                  </a>
                </Button>
              )}
              {data.id && (
                <>
                  <Button
                    variant="secondary"
                    icon={inLib ? "check" : "plus"}
                    aria-pressed={inLib}
                    onClick={() => toggleLibrary(data.id!)}
                  >
                    {inLib ? "IN LIBRARY" : "LIBRARY"}
                  </Button>
                  <Button
                    variant={wished ? "danger" : "outline"}
                    icon={wished ? "heart-filled" : "heart"}
                    aria-pressed={wished}
                    onClick={() => toggleWish(data.id!)}
                  >
                    {wished ? "WISHLISTED" : "WISHLIST"}
                  </Button>
                </>
              )}
            </div>

            {shots.length > 0 && (
              <>
                <SectionLabel className="mb-3.5 mt-9">SCREENSHOTS</SectionLabel>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                  {shots.map((shot, i) => (
                    <button
                      key={shot.url}
                      type="button"
                      onClick={() => setLightbox({ open: true, index: i })}
                      aria-label={`Expand screenshot ${i + 1}`}
                      className="ov-chamfer group aspect-video overflow-hidden border border-ov-border transition-[border-color,scale] duration-150 hover:border-ov-teal active:scale-[0.97]"
                    >
                      <Image
                        src={igdbImage(shot.url, "t_screenshot_big")}
                        alt=""
                        fill
                        className="object-cover transition-transform group-hover:scale-[1.04]"
                        sizes="320px"
                      />
                      <span className="absolute bottom-2 right-2 flex size-6 items-center justify-center bg-ov-bg/75 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <OvIcon name="expand" className="text-xs" />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {related.length > 0 && (
              <>
                <SectionLabel className="mb-4 mt-9">RECOMMENDED</SectionLabel>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[18px]">
                  {related.map((game) => (
                    <GameGridCard key={game.id || game.slug} game={game} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsPanel gameId={data.id} gameSlug={String(slug)} gameName={data.name} />
          </TabsContent>
        </Tabs>

        {/* self-start keeps the panel at its natural height instead of stretching
            to match the tab content beside it. */}
        <Panel asChild className="w-full shrink-0 self-start p-5 lg:w-[300px]">
          <aside aria-label="Game details">
            <div className="flex justify-between border-b border-ov-border py-2.5 text-xs">
              <span className="text-ov-dim">RELEASE</span>
              <span className="text-white">
                {data.release_dates?.[0]?.human ||
                  formatYear(data.first_release_date) ||
                  "TBD"}
              </span>
            </div>
            <div className="border-b border-ov-border py-3">
              <Eyebrow className="mb-2">PLATFORMS</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {(data.platforms || []).slice(0, 6).map((p) => (
                  <Tag key={p.name} tone="teal">
                    {platformAbbr(p.name)}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="border-b border-ov-border py-3">
              <Eyebrow className="mb-2">GENRES</Eyebrow>
              <div className="flex flex-wrap gap-1.5">
                {(data.genres || []).map((g) => (
                  <Tag key={g.name} tone="rose">
                    {g.name}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="pt-3">
              <Eyebrow className="mb-2">WHERE TO BUY</Eyebrow>
              <div className="flex flex-col gap-1.5">
                {data.steamAppId && (
                  <StoreRow
                    name="Steam"
                    href={`https://store.steampowered.com/app/${data.steamAppId}`}
                    trailing={
                      data.steamPrice ? (
                        <Price
                          current={data.steamPrice.current}
                          original={data.steamPrice.original}
                        />
                      ) : (
                        <StoreAction>VIEW</StoreAction>
                      )
                    }
                  />
                )}
                {data.psStore ? (
                  // Tracked listings open the price history; the modal links on to the store.
                  <StoreRow
                    name="PlayStation Store"
                    sublabel="PRICE HISTORY"
                    onClick={() => setPriceModalOpen(true)}
                    trailing={
                      data.psStore.price ? (
                        <Price
                          current={data.psStore.price.current}
                          original={data.psStore.price.original}
                        />
                      ) : (
                        <StoreAction>TRACK</StoreAction>
                      )
                    }
                  />
                ) : (
                  <StoreRow
                    name="PlayStation Store"
                    href={`https://store.playstation.com/en-in/search/${encodeURIComponent(data.name)}`}
                    trailing={<StoreAction>SEARCH</StoreAction>}
                  />
                )}
                <StoreRow
                  name="Amazon.in"
                  href={`https://www.amazon.in/s?k=${encodeURIComponent(`${data.name} game`)}`}
                  trailing={<StoreAction>SEARCH</StoreAction>}
                />
              </div>
            </div>
          </aside>
        </Panel>
      </div>

      {data.psStore && (
        <PriceHistoryModal
          open={priceModalOpen}
          onOpenChange={setPriceModalOpen}
          slug={String(slug)}
          gameName={data.name}
        />
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
