"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCollection } from "@/context/CollectionContext";
import type { HeroGame } from "@/utils/types";
import { developerName, formatYear, landscapeArt } from "@/utils/overdrive";
import { discountLabel } from "@/utils/price";
import { Button, Eyebrow, IconButton, Rating } from "@/components/ui";
import { cx } from "@/utils/cx";
import { TrailerDialog } from "./TrailerDialog";

const SLIDE_MS = 7000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function kicker(game: HeroGame) {
  const off = discountLabel(game.price);
  if (off) return `PRICE DROP · ${off}`;
  if ((game.aggregated_rating ?? 0) >= 90) return "CRITICS' PICK";
  return "TRENDING";
}

/// Discover's hero: five recent, well-reviewed games with landscape key art.
/// Auto-advances, but pauses on hover or keyboard focus, has an explicit
/// pause control (WCAG 2.2.2) and never autoplays under reduced motion.
export function HeroCarousel({ games }: { games: HeroGame[] }) {
  const slides = games.filter((g) => landscapeArt(g.artworks, g.screenshots));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const { isWished, toggleWish } = useCollection();

  const autoplay = !paused && !hovering && !reducedMotion && !trailerOpen && slides.length > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [autoplay, index, slides.length]);

  if (slides.length === 0) return null;
  const game = slides[Math.min(index, slides.length - 1)];
  const art = landscapeArt(game.artworks, game.screenshots)!;
  const trailer = game.videos?.[0]?.video_id;
  const wished = game.id ? isWished(game.id) : false;
  const platforms = (game.platforms ?? [])
    .map((p) => p.abbreviation)
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");

  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setHovering(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
      }}
      className="relative overflow-hidden lg:h-[600px]"
    >
      {/* Phones: art across the top. Desktop: the right two-thirds. next/image's
          fill styles are inline, so the box is set on a wrapper. */}
      <div className="absolute inset-x-0 top-0 h-80 lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[68%]">
        <Image
          key={art}
          src={art}
          alt=""
          fill
          priority
          sizes="(min-width: 800px) 68vw, 100vw"
          className="animate-ov-fade-up object-cover object-[50%_35%]"
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-[322px] bg-linear-to-t from-ov-bg from-6% via-ov-bg/55 via-45% to-transparent to-75% lg:hidden" />
      <div className="absolute inset-0 hidden bg-linear-to-r from-ov-bg from-32% via-ov-bg/80 via-45% to-ov-bg/15 lg:block" />
      <div className="absolute inset-0 hidden bg-linear-to-t from-ov-bg to-transparent to-40% lg:block" />

      <div className="relative mx-auto max-w-[1440px] lg:h-full">
        <div
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}: ${game.name}`}
          className="flex flex-col gap-3 px-4 pt-[212px] lg:absolute lg:top-[88px] lg:left-8 lg:w-[min(600px,calc(100%-64px))] lg:gap-5 lg:p-0"
        >
          <span className="flex items-center gap-2.5 font-mono text-micro tracking-[0.1em] text-ov-teal lg:text-label">
            <span aria-hidden className="h-px w-4 bg-ov-teal lg:w-5" />
            {kicker(game)}
          </span>
          <h2 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.025em] text-balance text-ov-white lg:text-hero lg:leading-none lg:tracking-[-0.03em]">
            <Link href={`/games/${game.slug}`} className="hover:text-ov-teal-hover">
              {game.name}
            </Link>
          </h2>
          <p className="text-sm text-ov-dim lg:text-body">
            {[developerName(game.involved_companies), formatYear(game.first_release_date), game.genres?.[0]?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {game.summary && (
            <p className="line-clamp-3 hidden text-lead leading-relaxed text-pretty text-ov-text lg:block">
              {game.summary}
            </p>
          )}
          <div className="grid grid-cols-3 border border-ov-border bg-[rgb(10_14_24/0.85)] lg:flex lg:w-max lg:max-w-full [&>*]:min-w-0 [&>*]:gap-1 [&>*]:px-3 [&>*]:py-2.5 [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-ov-border lg:[&>*]:px-5 lg:[&>*]:py-3">
            <div className="flex flex-col">
              <Eyebrow>CRITIC</Eyebrow>
              <Rating value={game.aggregated_rating} className="text-[19px] lg:text-2xl" />
            </div>
            <div className="flex flex-col">
              <Eyebrow>{game.price ? (game.price.store === "STEAM" ? "STEAM" : "PS STORE") : "PRICE"}</Eyebrow>
              <span className="truncate font-orbitron text-[17px] font-bold text-ov-white lg:text-2xl">
                {game.price?.current ?? "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <Eyebrow>HYPE</Eyebrow>
              <span className="font-orbitron text-[19px] font-bold text-ov-white lg:text-2xl">{game.hypes ?? "—"}</span>
            </div>
            {platforms && (
              <div className="hidden flex-col lg:flex">
                <Eyebrow>PLATFORMS</Eyebrow>
                <span className="pt-1.5 text-body font-medium text-ov-white">{platforms}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 lg:gap-3 lg:pt-1">
            {trailer && (
              <Button variant="primary" size="lg" icon="play" onClick={() => setTrailerOpen(true)} className="flex-1 lg:flex-none">
                Watch trailer
              </Button>
            )}
            {game.id && (
              <>
                <IconButton
                  icon={wished ? "heart-filled" : "heart"}
                  label={wished ? `Remove ${game.name} from wishlist` : `Add ${game.name} to wishlist`}
                  aria-pressed={wished}
                  onClick={() => toggleWish(game.id!)}
                  size="xl"
                  className={cx(
                    "border lg:hidden",
                    wished ? "border-ov-rose-deep bg-ov-rose-wash" : "border-ov-border-strong bg-ov-raised"
                  )}
                  iconClassName="text-lg text-ov-rose"
                />
                <span className="hidden lg:contents">
                  <Button
                    size="lg"
                    variant={wished ? "danger" : "secondary"}
                    icon={wished ? "heart-filled" : "heart"}
                    aria-pressed={wished}
                    onClick={() => toggleWish(game.id!)}
                  >
                    {wished ? "Wishlisted" : "Wishlist"}
                  </Button>
                </span>
              </>
            )}
            <span className="hidden lg:contents">
              <Button asChild size="lg" variant="ghost" chamfer={false}>
                <Link href={`/games/${game.slug}`}>View details</Link>
              </Button>
            </span>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center gap-1.5 px-4 pt-1 lg:absolute lg:right-8 lg:bottom-10 lg:gap-3 lg:p-0">
            <IconButton
              icon={paused ? "play" : "pause"}
              label={paused ? "Resume slideshow" : "Pause slideshow"}
              onClick={() => setPaused((p) => !p)}
              iconClassName="text-sm"
              size="lg"
              className="-ml-2.5 lg:order-3 lg:ml-0"
            />
            <div className="flex flex-1 gap-1 lg:order-2 lg:flex-none">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${s.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className="flex h-11 flex-1 items-center px-0.5 lg:h-auto lg:flex-none lg:py-2"
                >
                  <span
                    className={cx(
                      "block h-[3px] w-full transition-[width,background-color] duration-300",
                      i === index ? "bg-ov-teal lg:w-7" : "bg-ov-border-strong lg:w-3.5"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="pl-2 font-orbitron text-ui font-bold text-ov-white lg:order-1 lg:pl-0 lg:text-sm" aria-hidden>
              {String(index + 1).padStart(2, "0")}
              <span className="text-ov-faint"> / {String(slides.length).padStart(2, "0")}</span>
            </span>
          </div>
        )}
      </div>

      {trailer && (
        <TrailerDialog
          videoId={trailer}
          title={game.name}
          open={trailerOpen}
          onOpenChange={setTrailerOpen}
        />
      )}
    </section>
  );
}
