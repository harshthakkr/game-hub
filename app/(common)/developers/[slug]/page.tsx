"use client";

import { useSingleData } from "@/utils/hooks/useSingleData";
import { DeveloperPageProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { useScreenTitle } from "@/components/overdrive/ScreenTitle";
import { PageHeading, SectionHeader, GAME_GRID } from "@/components/ui";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { NoResults } from "@/components/overdrive/EmptyState";
import { GameFilterBar, useGameFilterSort } from "@/components/overdrive/GameFilterBar";
import { DeveloperDetailSkeleton } from "@/components/overdrive/Skeletons";
import { abbrev } from "@/utils/overdrive";
import { useRestoreScroll } from "@/utils/navMemory";

export default function Developer() {
  const { data, loading } = useSingleData<DeveloperPageProps>("developers");
  useRestoreScroll(!loading);
  const { covered, sort, setSort, visible } = useGameFilterSort(data?.developed || []);
  useScreenTitle(data?.name);

  if (loading) return <DeveloperDetailSkeleton />;
  if (!data?.name) {
    return (
      <div className="px-8 py-20 text-center text-ov-muted">
        Developer not found.
      </div>
    );
  }

  return (
    <PageContainer>
      {/* Page header: identity, links and blurb read as one block. */}
      <div className="flex flex-col gap-3 lg:gap-4">
        <div className="flex items-center gap-4">
          <span className="ov-chamfer ov-chamfer-sm flex size-14 shrink-0 items-center justify-center border border-ov-border-strong bg-ov-raised font-orbitron text-lg font-bold">
            {abbrev(data.name)}
          </span>
          <PageHeading title={data.name} />
        </div>

        {data.websites && data.websites.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {data.websites.slice(0, 4).map((website) => (
              <a
                key={website.id}
                href={website.url}
                target="_blank"
                rel="noreferrer"
                className="text-ov-teal hover:text-ov-teal-hover"
              >
                {website.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            ))}
          </div>
        )}

        {data.description && (
          <p className="max-w-[720px] font-body text-base leading-relaxed text-ov-text">{data.description}</p>
        )}
      </div>

      <section className="flex flex-col gap-4 lg:gap-5" aria-label="Games">
        <SectionHeader
          title="Games"
          meta={covered.length ? `${covered.length}` : undefined}
          action={covered.length > 0 ? <GameFilterBar sort={sort} setSort={setSort} /> : undefined}
        />
        {covered.length === 0 ? (
          <NoResults description="No games listed for this developer yet." />
        ) : (
          <div className={GAME_GRID}>
            {visible.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
