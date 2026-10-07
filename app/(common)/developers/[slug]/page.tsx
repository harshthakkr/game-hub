"use client";

import Link from "next/link";
import { useSingleData } from "@/utils/hooks/useSingleData";
import { DeveloperPageProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { NoResults } from "@/components/overdrive/EmptyState";
import { GameFilterBar, useGameFilterSort } from "@/components/overdrive/GameFilterBar";
import { DeveloperDetailSkeleton } from "@/components/overdrive/Skeletons";
import { abbrev } from "@/utils/overdrive";

export default function Developer() {
  const { data, loading } = useSingleData<DeveloperPageProps>("developers");
  const { covered, sort, setSort, visible } = useGameFilterSort(data?.developed || []);

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
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-ov-rose font-orbitron text-xl font-black text-ov-rose">
          {abbrev(data.name)}
        </div>
        <PageTitle title={data.name.toUpperCase()} subtitle="studio profile" />
      </div>

      {data.websites && data.websites.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 text-ui">
          {data.websites.map((website) => (
            <Link
              key={website.id}
              href={website.url}
              target="_blank"
              className="text-ov-teal transition-colors duration-150 hover:text-ov-white hover:underline"
            >
              {website.url}
            </Link>
          ))}
        </div>
      )}

      {data.description && (
        <p className="mb-8 max-w-[720px] text-body leading-relaxed text-ov-text">
          {data.description}
        </p>
      )}

      <div className="mb-4 font-orbitron text-ui font-bold tracking-hud-wide text-ov-rose">
        DEVELOPED GAMES
      </div>
      {covered.length === 0 ? (
        <NoResults description="No games listed for this developer yet." />
      ) : (
        <>
          <GameFilterBar sort={sort} setSort={setSort} />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
            {visible.map((game) => (
              <GameGridCard key={game.id || game.slug} game={game} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
