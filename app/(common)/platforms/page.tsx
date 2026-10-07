"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { PlatformsSkeleton, PanelTileSkeletons } from "@/components/overdrive/Skeletons";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { platformAbbr } from "@/utils/overdrive";

export default function Platforms() {
  const { data, hasMore, loading, loadingMore, handlePagination } = useData<CardProps>(
    "platforms",
    40
  );

  if (loading) return <PlatformsSkeleton />;

  return (
    <PageContainer>
      <PageTitle title="PLATFORMS" subtitle="hardware index" />
      {data.length === 0 ? (
        <NoResults description="No platforms found right now. Check back later." />
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {data.map((p) => (
              <Link
                key={p.id}
                href={`/platforms/${p.slug}`}
                className="group ov-chamfer border border-ov-border bg-ov-panel p-[18px] transition-all duration-200 hover:-translate-y-1 hover:border-ov-teal active:scale-[0.98]"
              >
                <div className="mb-3.5 flex h-[38px] w-[38px] items-center justify-center border border-ov-teal font-orbitron text-sm font-black text-ov-teal transition-colors duration-150 group-hover:bg-ov-teal group-hover:text-ov-bg">
                  {platformAbbr(p.name)}
                </div>
                <div className="text-base font-semibold text-white">{p.name}</div>
                <div className="mt-1.5 flex items-center gap-1 text-label tracking-wide text-ov-muted transition-colors duration-150 group-hover:text-ov-teal">
                  BROWSE
                  <OvIcon name="chevron-right" className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
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
