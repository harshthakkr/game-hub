"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { DevelopersSkeleton, PanelTileSkeletons } from "@/components/overdrive/Skeletons";
import { abbrev } from "@/utils/overdrive";
import { PageHeading, Panel, tileGrid } from "@/components/ui";

export default function Developers() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<CardProps>(
    "developers",
    40
  );

  if (loading) return <DevelopersSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Developers" description="Studios and publishers in the catalogue." />
      {data.length === 0 ? (
        <NoResults description="No developers found right now. Check back later." />
      ) : (
        <>
          <div className={tileGrid(260)}>
            {data.map((d) => (
              <Panel asChild key={d.id} cut="none" interactive className="flex items-center gap-3 p-3 hover:border-ov-teal lg:gap-4 lg:p-4">
                <Link href={`/developers/${d.slug}`}>
                  <span className="ov-chamfer ov-chamfer-sm flex size-11 shrink-0 items-center justify-center border border-ov-border-strong bg-ov-raised font-orbitron text-sm font-bold text-ov-white">
                    {abbrev(d.name)}
                  </span>
                  <span className="truncate text-body font-semibold text-ov-white">{d.name}</span>
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
