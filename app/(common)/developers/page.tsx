"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { DevelopersSkeleton, PanelTileSkeletons } from "@/components/overdrive/Skeletons";
import { abbrev } from "@/utils/overdrive";
import { Panel } from "@/components/ui";

export default function Developers() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<CardProps>(
    "developers",
    40
  );

  if (loading) return <DevelopersSkeleton />;

  return (
    <PageContainer>
      <PageTitle title="DEVELOPERS" subtitle="studios & publishers" />
      {data.length === 0 ? (
        <NoResults description="No developers found right now. Check back later." />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {data.map((d) => (
              <Panel asChild key={d.id} cut="br" interactive className="group ov-chamfer-sm flex items-center gap-3.5 p-4">
                <Link href={`/developers/${d.slug}`}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-ov-rose font-orbitron text-base font-black text-ov-rose transition-colors duration-150 group-hover:bg-ov-rose group-hover:text-ov-bg">
                    {abbrev(d.name)}
                  </div>
                  <div>
                    <div className="text-body font-semibold text-white">{d.name}</div>
                    <div className="mt-1 text-label tracking-wide text-ov-muted">
                      STUDIO · VIEW GAMES
                    </div>
                  </div>
                </Link>
              </Panel>
            ))}
            {loadingMore && <PanelTileSkeletons count={8} />}
          </div>
          {hasMore && (
            <LoadMoreButton onClick={handlePagination} loading={loadingMore} />
          )}
        </>
      )}
    </PageContainer>
  );
}
