"use client";

import Image from "next/image";
import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import type { GenreTile } from "@/lib/genres";
import { PageContainer } from "@/components/overdrive/PageShell";
import { NoResults } from "@/components/overdrive/EmptyState";
import { GenresSkeleton } from "@/components/overdrive/Skeletons";
import { PageHeading, tileGrid } from "@/components/ui";
import { cx } from "@/utils/cx";

/// Fan positions, back to front. The most-rated game (covers[0]) sits in
/// front; hovering the tile spreads the fan.
const FAN = [
  "z-10 -rotate-6 group-hover:-translate-x-2 group-hover:-rotate-[10deg]",
  "z-20 -ml-6 lg:-ml-9 group-hover:-translate-y-1",
  "z-30 -ml-6 rotate-6 lg:-ml-9 group-hover:translate-x-2 group-hover:rotate-[10deg]",
];

/// One genre: its own games' covers, tinted with the lead cover's hue (the
/// same accent extraction as game pages), so each tile looks like its genre.
function GenreCard({ genre }: { genre: GenreTile }) {
  const fan = genre.covers.slice(0, 3).reverse();
  return (
    <Link
      href={`/genres/${genre.slug}`}
      style={{ "--genre": genre.accent ?? "var(--color-ov-teal)" } as React.CSSProperties}
      className="ov-chamfer group relative isolate flex h-[148px] flex-col overflow-hidden border border-ov-border bg-ov-panel p-4 transition-colors duration-200 hover:border-[color-mix(in_oklch,var(--genre)_50%,var(--color-ov-border))] lg:h-[168px] lg:p-5"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_130%_at_100%_0%,color-mix(in_oklch,var(--genre)_32%,transparent),transparent_62%)] transition-opacity duration-200 group-hover:opacity-90"
      />
      <span aria-hidden className="absolute top-3 right-4 -z-10 flex lg:top-4 lg:right-6">
        {fan.map((src, i) => (
          <span
            key={src}
            className={cx(
              "ov-chamfer ov-chamfer-sm relative h-14 w-[42px] overflow-hidden shadow-[0_10px_24px_rgb(0_0_0/0.55)] transition-transform duration-300 ease-out lg:h-[88px] lg:w-[66px]",
              FAN[i + (3 - fan.length)]
            )}
          >
            <Image src={src} alt="" fill sizes="66px" className="object-cover" />
          </span>
        ))}
      </span>
      {/* Scrim: the fan fades into the panel, so long names stay readable. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-ov-panel from-30% to-transparent to-80%"
      />
      <span className="mt-auto flex flex-col gap-1">
        <span className="text-body leading-snug font-semibold text-ov-white lg:text-lg">{genre.name}</span>
        <span className="font-hud text-label text-ov-dim">{genre.count.toLocaleString("en-IN")} games</span>
      </span>
    </Link>
  );
}

export default function Genres() {
  const { data, loading } = useData<GenreTile>("genres", 40);

  if (loading) return <GenresSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Genres" description="Browse by category." />
      {data.length === 0 ? (
        <NoResults description="No genres found right now. Check back later." />
      ) : (
        <div className={tileGrid(260, 2)}>
          {data.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
