"use client";

import Image from "next/image";
import Link from "next/link";
import type { FeaturedPlatform, Maker, PlatformDirectory, PlatformEntry } from "@/lib/platforms";
import { PageContainer } from "@/components/overdrive/PageShell";
import { NoResults } from "@/components/overdrive/EmptyState";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { PlatformsSkeleton } from "@/components/overdrive/Skeletons";
import { PageHeading, Panel, SectionHeader, tileGrid } from "@/components/ui";
import { platformAbbr } from "@/utils/overdrive";
import { useCachedJson } from "@/utils/hooks/useCachedJson";
import { useRestoreScroll } from "@/utils/navMemory";

/// One hue per maker, all at the same lightness and chroma (like the game
/// accents), so the tint says "whose platform" without any tile shouting.
const MAKER_TINT: Record<Maker, string> = {
  playstation: "oklch(0.72 0.13 262)",
  xbox: "oklch(0.72 0.13 145)",
  nintendo: "oklch(0.72 0.13 25)",
  pc: "var(--color-ov-teal)",
  sega: "oklch(0.72 0.13 235)",
  atari: "oklch(0.72 0.13 55)",
  other: "var(--color-ov-teal)",
};

const games = (count: number) => `${count.toLocaleString("en-IN")} games`;

/// Today's platforms: an art strip of its most-rated recent games, the maker
/// tint, and a typographic wordmark (IGDB's logos are inconsistent variants,
/// e.g. "PS5 Pro" for PS5, so the name is set in our own type instead).
function FeaturedCard({ platform }: { platform: FeaturedPlatform }) {
  return (
    <Link
      href={`/platforms/${platform.slug}`}
      style={{ "--maker": MAKER_TINT[platform.maker] } as React.CSSProperties}
      className="ov-chamfer group relative isolate flex h-[200px] flex-col justify-end overflow-hidden border border-ov-border bg-ov-panel p-4 transition-colors duration-200 hover:border-[color-mix(in_oklch,var(--maker)_55%,var(--color-ov-border))] lg:h-[240px] lg:p-5"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 -z-20 flex h-[62%] gap-1 opacity-70 transition-opacity duration-300 group-hover:opacity-90">
        {platform.covers.slice(0, 6).map((src) => (
          <span key={src} className="relative h-full min-w-0 flex-1">
            <Image src={src} alt="" fill sizes="120px" className="object-cover object-top" />
          </span>
        ))}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--color-ov-panel)_38%,color-mix(in_oklch,var(--color-ov-panel)_55%,transparent)_70%,transparent),radial-gradient(120%_90%_at_0%_100%,color-mix(in_oklch,var(--maker)_30%,transparent),transparent_70%)]"
      />
      <span className="font-orbitron text-lg leading-none font-bold tracking-[0.04em] text-ov-white uppercase lg:text-[30px]">
        {platform.label}
      </span>
      <span className="mt-2 flex items-center gap-2 font-hud text-label text-ov-dim">
        <span aria-hidden className="size-1.5 bg-(--maker)" />
        {games(platform.count)}
        <OvIcon
          name="arrow-right"
          className="ml-auto text-sm text-ov-muted transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-ov-white"
        />
      </span>
    </Link>
  );
}

/// Compact tile in a maker section: short code, full name, game count.
/// Two per row on phones (code stacked over the name), a row from sm up.
function PlatformTile({ platform }: { platform: PlatformEntry }) {
  return (
    // Not Panel's `interactive`: its hover border would fight the maker tint.
    <Panel
      asChild
      style={{ "--maker": MAKER_TINT[platform.maker] } as React.CSSProperties}
      className="flex flex-col items-start gap-2.5 p-3 transition-[border-color] duration-150 hover:border-[color-mix(in_oklch,var(--maker)_55%,var(--color-ov-border))] focus-visible:border-ov-teal sm:flex-row sm:items-center sm:gap-3 lg:gap-4 lg:p-4"
    >
      <Link href={`/platforms/${platform.slug}`}>
        <span className="flex h-10 min-w-12 shrink-0 items-center justify-center border border-[color-mix(in_oklch,var(--maker)_45%,var(--color-ov-border))] px-2 font-orbitron text-ui font-bold text-(--maker)">
          {platformAbbr(platform.name, platform.abbreviation)}
        </span>
        <span className="flex w-full min-w-0 flex-col gap-0.5">
          <span className="truncate text-body leading-snug font-semibold text-ov-white">{platform.name}</span>
          <span className="font-hud text-label text-ov-dim">{games(platform.count)}</span>
        </span>
      </Link>
    </Panel>
  );
}

export default function Platforms() {
  const { data, failed } = useCachedJson<PlatformDirectory>("/api/platforms");
  useRestoreScroll(data !== null);

  if (failed)
    return (
      <PageContainer>
        <PageHeading title="Platforms" />
        <NoResults description="Couldn't load platforms right now. Check back later." />
      </PageContainer>
    );
  if (!data) return <PlatformsSkeleton />;

  return (
    <PageContainer rhythm="sections">
      <div className="flex flex-col gap-6 lg:gap-8">
        <PageHeading title="Platforms" description="Where you play, and every system before it." />
        <section aria-label="Where you play" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {data.featured.map((platform) => (
            <FeaturedCard key={platform.id} platform={platform} />
          ))}
        </section>
      </div>

      {data.makers.map(({ maker, label, platforms }) => (
        <section key={maker} aria-label={label} className="flex flex-col gap-4 lg:gap-5">
          <SectionHeader title={label} meta={`${platforms.length} systems`} />
          <div className={tileGrid(240, 2)}>
            {platforms.map((platform) => (
              <PlatformTile key={platform.id} platform={platform} />
            ))}
          </div>
        </section>
      ))}

      {data.other.length > 0 && (
        <details className="group/other flex flex-col">
          <summary className="flex cursor-pointer list-none items-baseline gap-3 border-b border-ov-border pb-4 [&::-webkit-details-marker]:hidden">
            <span className="text-lg font-semibold text-ov-white lg:text-section">Other systems</span>
            <span className="font-hud text-ui text-ov-muted">{data.other.length}</span>
            <OvIcon
              name="chevron-down"
              className="ml-auto self-center text-base text-ov-dim transition-transform duration-200 group-open/other:rotate-180"
            />
          </summary>
          <ul className="grid grid-cols-1 gap-x-8 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.other.map((platform) => (
              <li key={platform.id}>
                <Link
                  href={`/platforms/${platform.slug}`}
                  className="flex items-baseline justify-between gap-3 border-b border-ov-raised py-2.5 text-sm text-ov-text hover:text-ov-white"
                >
                  <span className="truncate">{platform.name}</span>
                  <span className="shrink-0 font-hud text-label text-ov-muted">{platform.count.toLocaleString("en-IN")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </PageContainer>
  );
}
