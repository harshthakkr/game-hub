"use client";

import Link from "next/link";
import { useData } from "@/utils/hooks/useData";
import { CardProps } from "@/utils/types";
import { PageContainer } from "@/components/overdrive/PageShell";
import { NoResults } from "@/components/overdrive/EmptyState";
import { GenresSkeleton } from "@/components/overdrive/Skeletons";
import { PageHeading } from "@/components/ui";
import { genreGradient } from "@/utils/overdrive";

export default function Genres() {
  const { data, loading } = useData<CardProps>("genres", 40);

  if (loading) return <GenresSkeleton />;

  return (
    <PageContainer>
      <PageHeading title="Genres" description="Browse by category." />
      {data.length === 0 ? (
        <NoResults description="No genres found right now. Check back later." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {data.map((g) => (
            <Link
              key={g.id}
              href={`/genres/${g.slug}`}
              className={`ov-chamfer group h-[140px] overflow-hidden bg-linear-to-br ${genreGradient(g.name)}`}
            >
              <span className="absolute inset-0 bg-linear-to-r from-ov-bg/94 from-25% to-ov-bg/55 transition-opacity duration-200 group-hover:opacity-85" />
              <span className="absolute bottom-4.5 left-5 text-xl font-semibold text-ov-white">{g.name}</span>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
