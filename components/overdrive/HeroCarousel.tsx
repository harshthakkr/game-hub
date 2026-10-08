"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCollection } from "@/context/CollectionContext";
import type { HeroGame } from "@/utils/types";
import { developerName, formatYear, landscapeArt } from "@/utils/overdrive";
import { discountLabel } from "@/utils/price";
import { Button, Eyebrow, IconButton, Rating, StatStrip } from "@/components/ui";
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
  const slides = games.filter((g) => landscapeArt(g.artworks));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const { isWished, toggleWish } = useCollection();

  const autoplay = !paused && !hovering && !reducedMotion && !trailerOpen && slides.length > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [autoplay, index, slides.length]);

  if (slides.length === 0) return null;
  const game = slides[Math.min(index, slides.length - 1)];
  const art = landscapeArt(game.artworks)!;
  const trailer = game.videos?.[0]?.video_id;
  const wished = game.id ? isWished(game.id) : false;
  const platforms = (game.platforms ?? [])
    .map((p) => p.abbreviation)
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");

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
      className="relative h-[560px] overflow-hidden md:h-[600px]"
    >
      {/* next/image's fill styles are inline, so the art's box is set on a wrapper. */}
      <div className="absolute inset-0 md:left-auto md:w-[68%]">
        <Image
          key={art}
          src={art}
          alt=""
          fill
          priority
          sizes="(min-width: 586px) 68vw, 100vw"
          className="animate-ov-fade-up object-cover object-[50%_35%]"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-ov-bg from-0% via-ov-bg/80 via-45% to-ov-bg/15 md:from-32%" />
      <div className="absolute inset-0 bg-linear-to-t from-ov-bg to-transparent to-40%" />

      <div className="relative mx-auto h-full max-w-[1440px]">
        <div
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}: ${game.name}`}
          className="absolute top-12 right-4 left-4 flex max-w-[600px] flex-col gap-5 md:top-[88px] md:left-8"
        >
          <span className="flex items-center gap-2.5 font-mono text-label tracking-[0.1em] text-ov-teal">
            <span aria-hidden className="h-px w-5 bg-ov-teal" />
            {kicker(game)}
          </span>
          <h2 className="text-[40px] leading-none font-semibold tracking-[-0.03em] text-balance text-ov-white md:text-hero">
            <Link href={`/games/${game.slug}`} className="hover:text-ov-teal-hover">
              {game.name}
            </Link>
          </h2>
          <p className="text-body text-ov-dim">
            {[developerName(game.involved_companies), formatYear(game.first_release_date), game.genres?.[0]?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {game.summary && (
            <p className="line-clamp-3 hidden text-lead leading-relaxed text-pretty text-ov-text md:block">
              {game.summary}
            </p>
          )}
          <StatStrip className="bg-[rgb(10_14_24/0.78)]">
            <div className="flex flex-col gap-1">
              <Eyebrow>CRITIC</Eyebrow>
              <Rating value={game.aggregated_rating} className="text-2xl" />
            </div>
            {game.price && (
              <div className="flex flex-col gap-1">
                <Eyebrow>{game.price.store === "STEAM" ? "STEAM" : "PS STORE"}</Eyebrow>
                <span className="font-orbitron text-2xl font-bold text-ov-white">{game.price.current}</span>
              </div>
            )}
            {game.hypes ? (
              <div className="flex flex-col gap-1">
                <Eyebrow>HYPE</Eyebrow>
                <span className="font-orbitron text-2xl font-bold text-ov-white">{game.hypes}</span>
              </div>
            ) : null}
            {platforms && (
              <div className="hidden flex-col gap-1 md:flex">
                <Eyebrow>PLATFORMS</Eyebrow>
                <span className="pt-1.5 text-body font-medium text-ov-white">{platforms}</span>
              </div>
            )}
          </StatStrip>
          <div className="flex flex-wrap gap-3 pt-1">
            {trailer && (
              <Button variant="primary" size="lg" icon="play" onClick={() => setTrailerOpen(true)}>
                Watch trailer
              </Button>
            )}
            {game.id && (
              <Button
                size="lg"
                variant={wished ? "danger" : "secondary"}
                icon={wished ? "heart-filled" : "heart"}
                aria-pressed={wished}
                onClick={() => toggleWish(game.id!)}
              >
                {wished ? "Wishlisted" : "Wishlist"}
              </Button>
            )}
            <Button asChild size="lg" variant="ghost" chamfer={false}>
              <Link href={`/games/${game.slug}`}>View details</Link>
            </Button>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute right-4 bottom-8 flex items-center gap-3 md:right-8 md:bottom-10">
            <span className="font-orbitron text-sm font-bold text-ov-white" aria-hidden>
              {String(index + 1).padStart(2, "0")}
              <span className="text-ov-faint"> / {String(slides.length).padStart(2, "0")}</span>
            </span>
            <div className="flex gap-1">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${s.name}`}
                  aria-current={i === index ? "true" : undefined}
                  className="py-2"
                >
                  <span
                    className={cx(
                      "block h-[3px] transition-[width,background-color] duration-300",
                      i === index ? "w-7 bg-ov-teal" : "w-3.5 bg-ov-border-strong"
                    )}
                  />
                </button>
              ))}
            </div>
            <IconButton
              icon={paused ? "play" : "pause"}
              label={paused ? "Resume slideshow" : "Pause slideshow"}
              onClick={() => setPaused((p) => !p)}
              iconClassName="text-sm"
            />
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
