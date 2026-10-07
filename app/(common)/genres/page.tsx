"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { NoResults } from "@/components/overdrive/EmptyState";
import { GenresSkeleton } from "@/components/overdrive/Skeletons";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { genreGradient } from "@/utils/overdrive";

export default function Genres() {
  const { data, loading } = useData<CardProps>("genres", 40);

  if (loading) return <GenresSkeleton />;

  return (
    <PageContainer>
      <PageTitle title="GENRES" subtitle="browse by category" />
      {data.length === 0 ? (
        <NoResults description="No genres found right now. Check back later." />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {data.map((g) => (
            <Link
              key={g.id}
              href={`/genres/${g.slug}`}
              className={`group relative overflow-hidden border border-ov-border bg-linear-to-br p-[22px_18px] transition-all duration-200 hover:-translate-y-1 hover:border-ov-teal active:scale-[0.98] ${genreGradient(g.name)}`}
            >
              <div className="absolute inset-0 bg-ov-bg/72 transition-opacity duration-200 group-hover:bg-ov-bg/55" />
              <div className="relative">
                <div className="font-orbitron text-lg font-bold text-white">
                  {g.name}
                </div>
                <div className="mt-2 flex items-center gap-1 text-label tracking-wide text-ov-teal">
                  BROWSE GAMES
                  <OvIcon name="chevron-right" className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
