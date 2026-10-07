"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useSingleData } from "@/utils/hooks/useSingleData";
import { GamePageProps } from "@/utils/types";
import { useCollection } from "@/context/CollectionContext";
import { OvIcon } from "@/components/overdrive/OvIcon";
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

// Overview, media and related all describe the game itself, so they share one
// tab. Reviews stay separate: long-form, paginated, and written as well as read.
const TABS = ["OVERVIEW", "REVIEWS"] as const;
type Tab = (typeof TABS)[number];

function igdbImage(url: string, size: string) {
  return `https:${url.replace("t_thumb", size)}`;
}

export default function Game() {
  const { data, loading } = useSingleData<GamePageProps>("games");
  const { isWished, isInLibrary, toggleWish, toggleLibrary } = useCollection();
  const [tab, setTab] = useState<Tab>("OVERVIEW");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const closePriceModal = useCallback(() => setPriceModalOpen(false), []);
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
        <div className="absolute inset-0 bg-gradient-to-t from-ov-bg via-[rgba(5,7,14,0.3)] to-transparent" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,212,191,.05) 1px, transparent 1px)",
            backgroundSize: "100% 30px",
          }}
        />
        <Link
          href="/games"
          className="absolute left-4 top-5 z-10 border border-ov-teal bg-[rgba(5,7,14,0.7)] px-3.5 py-2 text-xs tracking-wide text-ov-teal transition-colors duration-150 hover:bg-ov-teal hover:text-ov-bg active:scale-95 lg:left-[34px]"
        >
          ◂ BACK
        </Link>
        <div className="absolute bottom-[26px] left-4 right-4 z-10 flex flex-wrap items-end gap-6 lg:left-[34px] lg:right-[34px]">
          {cover && (
            <div className="relative aspect-[3/4] w-[110px] shrink-0 lg:w-[150px]">
              <Image src={cover} alt={data.name} fill className="object-cover" sizes="150px" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {data.genres?.[0] && (
              <span className="border border-ov-rose px-2 py-1 text-[11px] tracking-[3px] text-ov-rose">
                {data.genres[0].name}
              </span>
            )}
            <h1 className="mt-3.5 font-orbitron text-[28px] font-black text-white lg:text-[34px]">
              {data.name}
            </h1>
            <div className="mt-2.5 text-[15px] text-ov-text">
              {developerName(data.involved_companies)} ·{" "}
              {formatYear(data.first_release_date)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-orbitron text-4xl font-black text-ov-teal">
              {formatRating(data.aggregated_rating)}
            </div>
            <div className="text-[10px] tracking-[2px] text-ov-dim">CRITIC INDEX</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-[26px] px-4 py-[26px] lg:px-6">
        <div className="min-w-[280px] flex-1">
          <div className="mb-[22px] flex flex-wrap gap-0 border-b border-ov-border">
            {TABS.map((name) => {
              const active = tab === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTab(name)}
                  aria-current={active ? "true" : undefined}
                  className="cursor-pointer px-4 py-2.5 text-xs tracking-[2px] transition-colors duration-150 hover:text-ov-teal"
                  style={{
                    color: active ? "#2dd4bf" : "#5b6b82",
                    borderBottom: `2px solid ${active ? "#2dd4bf" : "transparent"}`,
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {tab === "OVERVIEW" && (
            <>
              <div className="mb-3.5 font-orbitron text-xs font-bold tracking-[2px] text-ov-rose">
                ABOUT
              </div>
              <p className="max-w-[620px] text-[15px] leading-[1.9] text-ov-text">
                {data.summary || data.storyline || "No summary available."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ov-clip-sm flex items-center px-[18px] py-3 font-orbitron text-xs font-bold tracking-[1px] transition-transform duration-150 hover:brightness-110 active:scale-95"
                    style={{
                      color: "#05070e",
                      background: "linear-gradient(#2dd4bf,#14b8a6)",
                    }}
                  >
                    <OvIcon name="play" className="mr-1.5 text-[12px]" />
                    TRAILER
                  </a>
                )}
                {data.id && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleLibrary(data.id!)}
                      className="ov-clip-sm px-[18px] py-3 text-[13px] tracking-[1px] transition-transform duration-150 hover:brightness-125 active:scale-95"
                      style={{
                        color: "#2dd4bf",
                        border: "1px solid #2dd4bf",
                        background: inLib ? "rgba(45,212,191,.16)" : "transparent",
                      }}
                    >
                      {inLib ? "✓ IN LIBRARY" : "+ LIBRARY"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWish(data.id!)}
                      className="ov-clip-sm px-[18px] py-3 text-[13px] tracking-[1px] transition-transform duration-150 hover:brightness-125 active:scale-95"
                      style={{
                        color: wished ? "#f43f5e" : "#c3cede",
                        border: `1px solid ${wished ? "#f43f5e" : "#c3cede"}`,
                        background: wished ? "rgba(244,63,94,.12)" : "transparent",
                      }}
                    >
                      ♥ {wished ? "WISHLISTED" : "WISHLIST"}
                    </button>
                  </>
                )}
              </div>

              {shots.length > 0 && (
                <>
                  <div className="mb-3.5 mt-9 font-orbitron text-xs font-bold tracking-[2px] text-ov-rose">
                    SCREENSHOTS
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                    {shots.map((shot, i) => (
                      <button
                        key={shot.url}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`Expand screenshot ${i + 1}`}
                        className="ov-clip-card group relative aspect-video overflow-hidden border border-ov-border transition-all duration-150 hover:border-ov-teal active:scale-[0.97]"
                      >
                        <Image
                          src={igdbImage(shot.url, "t_screenshot_big")}
                          alt=""
                          fill
                          className="object-cover transition-transform group-hover:scale-[1.04]"
                          sizes="320px"
                        />
                        <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center bg-[rgba(5,7,14,0.75)] text-[12px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          ⤢
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {related.length > 0 && (
                <>
                  <div className="mb-4 mt-9 font-orbitron text-xs font-bold tracking-[2px] text-ov-rose">
                    RECOMMENDED
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[18px]">
                    {related.map((game) => (
                      <GameGridCard key={game.id || game.slug} game={game} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === "REVIEWS" && (
            <ReviewsPanel
              gameId={data.id}
              gameSlug={String(slug)}
              gameName={data.name}
            />
          )}
        </div>

        {/* self-start keeps the panel at its natural height instead of stretching
            to match the tab content beside it. */}
        <aside className="ov-clip-panel w-full shrink-0 self-start border border-ov-border bg-ov-panel p-5 lg:w-[300px]">
          <div className="flex justify-between border-b border-ov-border py-2.5">
            <span className="text-xs text-ov-dim">RELEASE</span>
            <span className="text-xs text-white">
              {data.release_dates?.[0]?.human ||
                formatYear(data.first_release_date) ||
                "TBD"}
            </span>
          </div>
          <div className="border-b border-ov-border py-3">
            <div className="mb-2 text-[11px] tracking-wide text-ov-dim">PLATFORMS</div>
            <div className="flex flex-wrap gap-1.5">
              {(data.platforms || []).slice(0, 6).map((p) => (
                <span
                  key={p.name}
                  className="border border-ov-teal px-2 py-0.5 text-[11px] text-ov-teal"
                >
                  {platformAbbr(p.name)}
                </span>
              ))}
            </div>
          </div>
          <div className="border-b border-ov-border py-3">
            <div className="mb-2 text-[11px] tracking-wide text-ov-dim">GENRES</div>
            <div className="flex flex-wrap gap-1.5">
              {(data.genres || []).map((g) => (
                <span
                  key={g.name}
                  className="border border-ov-rose px-2 py-0.5 text-[11px] text-ov-rose"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-3">
            <div className="mb-2 text-[11px] tracking-wide text-ov-dim">WHERE TO BUY</div>
            <div className="flex flex-col gap-1.5">
              {data.steamAppId && (
                <a
                  href={`https://store.steampowered.com/app/${data.steamAppId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-ov-border px-3 py-2 text-[12px] transition-all duration-150 hover:border-ov-teal hover:bg-[rgba(45,212,191,0.05)] active:scale-[0.98]"
                >
                  <span className="text-ov-text">Steam</span>
                  {data.steamPrice ? (
                    <span className="flex items-center gap-2">
                      {data.steamPrice.original && (
                        <span className="text-[11px] text-ov-muted line-through">
                          {data.steamPrice.original}
                        </span>
                      )}
                      <span className="font-orbitron text-sm font-bold text-ov-teal">
                        {data.steamPrice.current}
                      </span>
                    </span>
                  ) : (
                    <span className="text-ov-dim">VIEW ▸</span>
                  )}
                </a>
              )}
              {data.psStore ? (
                // Tracked listings open the price history; the modal links on to the store.
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(true)}
                  className="flex items-center justify-between border border-ov-border px-3 py-2 text-left text-[12px] transition-all duration-150 hover:border-ov-teal hover:bg-[rgba(45,212,191,0.05)] active:scale-[0.98]"
                >
                  <span className="flex flex-col">
                    <span className="text-ov-text">PlayStation Store</span>
                    <span className="text-[10px] tracking-wide text-ov-dim">PRICE HISTORY ▸</span>
                  </span>
                  {data.psStore.price ? (
                    <span className="flex items-center gap-2">
                      {data.psStore.price.original && (
                        <span className="text-[11px] text-ov-muted line-through">
                          {data.psStore.price.original}
                        </span>
                      )}
                      <span className="font-orbitron text-sm font-bold text-ov-teal">
                        {data.psStore.price.current}
                      </span>
                    </span>
                  ) : (
                    <span className="text-ov-dim">TRACK ▸</span>
                  )}
                </button>
              ) : (
                <a
                  href={`https://store.playstation.com/en-in/search/${encodeURIComponent(data.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border border-ov-border px-3 py-2 text-[12px] transition-all duration-150 hover:border-ov-teal hover:bg-[rgba(45,212,191,0.05)] active:scale-[0.98]"
                >
                  <span className="text-ov-text">PlayStation Store</span>
                  <span className="text-ov-dim">SEARCH ▸</span>
                </a>
              )}
              <a
                href={`https://www.amazon.in/s?k=${encodeURIComponent(`${data.name} game`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-ov-border px-3 py-2 text-[12px] transition-all duration-150 hover:border-ov-teal hover:bg-[rgba(45,212,191,0.05)] active:scale-[0.98]"
              >
                <span className="text-ov-text">Amazon.in</span>
                <span className="text-ov-dim">SEARCH ▸</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {priceModalOpen && data.psStore && (
        <PriceHistoryModal
          slug={String(slug)}
          gameName={data.name}
          onClose={closePriceModal}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={fullShots}
          index={lightboxIndex}
          alt={data.name}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
