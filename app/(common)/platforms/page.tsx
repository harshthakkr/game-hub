"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { LoadMoreButton, NoResults } from "@/components/overdrive/EmptyState";
import { PlatformsSkeleton, PanelTileSkeletons } from "@/components/overdrive/Skeletons";
import { PageHeading, Panel } from "@/components/ui";
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
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {data.map((p) => (
            <Panel asChild key={p.id} interactive className="flex flex-col gap-4.5 p-5.5 hover:border-ov-teal">
              <Link href={`/platforms/${p.slug}`}>
                <span className="flex h-11 w-max min-w-[52px] items-center justify-center border border-ov-teal-deep px-2.5 font-orbitron text-body font-bold text-ov-teal">
                  {platformAbbr(p.name)}
                </span>
                <span className="text-lg font-semibold text-ov-white">{p.name}</span>
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
