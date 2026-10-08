"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { PlatformsSkeleton, PanelTileSkeletons } from "@/components/overdrive/Skeletons";
import { PageHeading, Panel, tileGrid } from "@/components/ui";
import { platformAbbr } from "@/utils/overdrive";

export default function Platforms() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<CardProps>("platforms", 40);

  if (loading) return <PlatformsSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Platforms" description="Browse the catalogue by hardware." />
      {data.length === 0 ? (
        <NoResults description="No platforms found right now. Check back later." />
      ) : (
        <div className={tileGrid(240, 2)}>
          {data.map((p) => (
            <Panel asChild key={p.id} interactive className="flex flex-col gap-3 p-4 hover:border-ov-teal lg:gap-4 lg:p-5">
              <Link href={`/platforms/${p.slug}`}>
                <span className="flex h-9 w-max min-w-11 items-center justify-center border border-ov-teal-deep px-2 font-orbitron text-ui font-bold text-ov-teal lg:h-11 lg:min-w-[52px] lg:px-2.5 lg:text-body">
                  {platformAbbr(p.name)}
                </span>
                <span className="text-body leading-snug font-semibold text-ov-white lg:text-lg">{p.name}</span>
              </Link>
            </Panel>
          ))}
          {loadingMore && <PanelTileSkeletons count={8} />}
        </div>
      )}
      {hasMore && <LoadMoreButton onClick={handlePagination} loading={loadingMore} />}
    </PageContainer>
  );
}
