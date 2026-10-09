"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import type { RankedStudio, StudioMatch } from "@/lib/developers";
import { PageContainer } from "@/components/overdrive/PageShell";
import { NoResults } from "@/components/overdrive/EmptyState";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { DevelopersSkeleton } from "@/components/overdrive/Skeletons";
import { Input, PageHeading } from "@/components/ui";
import { cx } from "@/utils/cx";

const pad = (rank: number) => String(rank).padStart(2, "0");
const origin = (s: { country: string | null; founded: number | null }) =>
  [s.country, s.founded && `since ${s.founded}`].filter(Boolean).join(" · ");
/// The studio's best-known titles, skipping repeats ("Doom" 1993 and 2016).
const knownFor = (s: RankedStudio, count: number) =>
  [...new Set(s.games.map((g) => g.name))].slice(0, count).join(", ");

/// Fan positions, back to front (as on genre tiles); hover spreads it.
const FAN = [
  "z-10 -rotate-6 group-hover:-translate-x-2 group-hover:-rotate-[10deg]",
  "z-20 -ml-7 lg:-ml-9 group-hover:-translate-y-1",
  "z-30 -ml-7 rotate-6 lg:-ml-9 group-hover:translate-x-2 group-hover:rotate-[10deg]",
];

/// Top three: a podium card with a fan of the studio's best-known covers,
/// tinted by the lead one.
function PodiumCard({ studio }: { studio: RankedStudio }) {
  const fan = studio.games.map((g) => g.cover).filter((c): c is string => !!c).slice(0, 3).reverse();
  return (
    <Link
      href={`/developers/${studio.slug}`}
      style={{ "--studio": studio.accent ?? "var(--color-ov-teal)" } as React.CSSProperties}
      className="ov-chamfer group relative isolate flex h-[188px] flex-col overflow-hidden border border-ov-border bg-ov-panel p-4 transition-colors duration-200 hover:border-[color-mix(in_oklch,var(--studio)_50%,var(--color-ov-border))] lg:h-[232px] lg:p-5"
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_130%_at_100%_0%,color-mix(in_oklch,var(--studio)_32%,transparent),transparent_62%)]"
      />
      <span aria-hidden className="absolute top-4 right-4 -z-10 flex lg:right-6">
        {fan.map((src, i) => (
          <span
            key={src}
            className={cx(
              "ov-chamfer ov-chamfer-sm relative h-[72px] w-[54px] overflow-hidden shadow-[0_10px_24px_rgb(0_0_0/0.55)] transition-transform duration-300 ease-out lg:h-[104px] lg:w-[78px]",
              FAN[i + (3 - fan.length)]
            )}
          >
            <Image src={src} alt="" fill sizes="78px" className="object-cover" />
          </span>
        ))}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-ov-panel from-35% to-transparent to-80%"
      />
      <span className="font-orbitron text-[28px] leading-none font-bold text-(--studio) lg:text-[36px]">
        <span className="sr-only">Rank </span>#{pad(studio.rank)}
      </span>
      <span className="mt-auto flex flex-col gap-1">
        <span className="text-lg leading-snug font-semibold text-ov-white lg:text-xl">{studio.name}</span>
        <span className="font-hud text-label text-ov-dim">{origin(studio)}</span>
        <span className="truncate text-ui text-ov-text">Known for {knownFor(studio, 2)}</span>
      </span>
    </Link>
  );
}

/// Places 4–50: rank, studio, origin, known for, and a small cover strip.
function LeaderRow({ studio }: { studio: RankedStudio }) {
  return (
    <li>
      <Link
        href={`/developers/${studio.slug}`}
        className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-x-3 border-b border-ov-raised px-2 py-3 transition-colors duration-150 hover:bg-ov-panel sm:grid-cols-[40px_minmax(0,1fr)_auto] lg:grid-cols-[48px_minmax(0,1.1fr)_minmax(0,1.4fr)_auto] lg:gap-x-5"
      >
        <span className="font-orbitron text-sm font-bold text-ov-muted lg:text-base">
          <span className="sr-only">Rank </span>
          {pad(studio.rank)}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-body font-semibold text-ov-white">{studio.name}</span>
          <span className="truncate font-hud text-label text-ov-dim">{origin(studio)}</span>
          {/* Phones/tablets: "known for" folds under the name. */}
          <span className="truncate text-ui text-ov-muted lg:hidden">Known for {knownFor(studio, 2)}</span>
        </span>
        <span className="hidden truncate text-ui text-ov-text lg:block">
          <span className="text-ov-muted">Known for </span>
          {knownFor(studio, 2)}
        </span>
        <span aria-hidden className="hidden gap-1 sm:flex">
          {studio.games.slice(0, 3).map((g) =>
            g.cover ? (
              <span key={g.slug} className="relative h-12 w-9 overflow-hidden bg-ov-raised">
                <Image src={g.cover} alt="" fill sizes="36px" className="object-cover" />
              </span>
            ) : null
          )}
        </span>
      </Link>
    </li>
  );
}

/// Debounced studio search; null while the box is empty.
function useStudioSearch(query: string) {
  const [results, setResults] = useState<StudioMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      axios
        .get<StudioMatch[]>("/api/developers", { params: { q }, signal: controller.signal })
        .then((res) => setResults(res.data))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  return { results, searching };
}

export default function Developers() {
  const [board, setBoard] = useState<RankedStudio[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const { results, searching } = useStudioSearch(query);

  useEffect(() => {
    axios
      .get<RankedStudio[]>("/api/developers")
      .then((res) => setBoard(res.data))
      .catch(() => setFailed(true));
  }, []);

  if (failed)
    return (
      <PageContainer>
        <PageHeading title="Developers" />
        <NoResults description="Couldn't load studios right now. Check back later." />
      </PageContainer>
    );
  if (!board) return <DevelopersSkeleton />;

  return (
    <PageContainer>
      <PageHeading
        title="Developers"
        note="top 50 studios"
        description="The studios behind the most-played games, ranked by the player ratings their games have collected."
      >
        <label className="relative block w-full lg:w-[320px]">
          <span className="sr-only">Search any studio</span>
          <OvIcon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base text-ov-muted"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any studio"
            className="pl-10"
          />
        </label>
      </PageHeading>

      {results !== null ? (
        <section aria-label="Search results" aria-busy={searching}>
          {results.length === 0 ? (
            <NoResults title="No studios found" description={`Nothing matches "${query.trim()}".`} />
          ) : (
            <ul className="border-t border-ov-raised">
              {results.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/developers/${s.slug}`}
                    className="flex items-center gap-3 border-b border-ov-raised px-2 py-3 transition-colors duration-150 hover:bg-ov-panel"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body font-semibold text-ov-white">{s.name}</span>
                      {origin(s) && <span className="block truncate font-hud text-label text-ov-dim">{origin(s)}</span>}
                    </span>
                    {s.rank && <span className="shrink-0 font-orbitron text-ui font-bold text-ov-teal">#{pad(s.rank)}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section aria-label="Top three studios" className="grid gap-3 md:grid-cols-3 lg:gap-4">
            {board.slice(0, 3).map((studio) => (
              <PodiumCard key={studio.id} studio={studio} />
            ))}
          </section>
          <ol start={4} aria-label="Studios ranked 4 to 50" className="border-t border-ov-raised">
            {board.slice(3).map((studio) => (
              <LeaderRow key={studio.id} studio={studio} />
            ))}
          </ol>
        </>
      )}
    </PageContainer>
  );
}
