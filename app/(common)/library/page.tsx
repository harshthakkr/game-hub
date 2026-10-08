"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loginHref, SHELVES, useCollection, type Shelf } from "@/context/CollectionContext";
import { useGamesByIds } from "@/utils/hooks/useGamesByIds";
import { PageContainer } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { LibrarySkeleton } from "@/components/overdrive/Skeletons";
import { ShelfMenu } from "@/components/overdrive/ShelfMenu";
import { ChipGroup, PageHeading, Rating } from "@/components/ui";
import { coverUrl } from "@/utils/overdrive";
import Image from "next/image";

type Tab = "ALL" | Shelf;

export default function LibraryPage() {
  const { library, shelfOf, ready, signedIn } = useCollection();
  const { games, loading } = useGamesByIds(library, ready && signedIn);
  const [tab, setTab] = useState<Tab>("ALL");

  const tabs = useMemo(
    () => [
      { value: "ALL" as Tab, label: "All", count: library.length },
      ...SHELVES.map((s) => ({
        value: s.value as Tab,
        label: s.label,
        count: library.filter((id) => shelfOf(id) === s.value).length,
      })),
    ],
    [library, shelfOf]
  );
  const visible = games.filter((g) => tab === "ALL" || (g.id && shelfOf(g.id) === tab));

  if (ready && !signedIn) {
    return (
      <PageContainer>
        <PageHeading title="Library" />
        <EmptyState
          icon="library"
          title="Sign in to see your library"
          description="Your library is saved to your account, so it follows you across devices."
          actionLabel="Sign in"
          actionHref={loginHref("/library")}
        />
      </PageContainer>
    );
  }
  if (!ready || (loading && games.length === 0 && library.length > 0)) return <LibrarySkeleton />;

  return (
    <PageContainer>
      <PageHeading
        title="Library"
        description="Games you own, on shelves: what you're playing, your backlog, and what you've finished."
      />
      <ChipGroup label="Shelf" variant="underline" options={tabs} value={tab} onValueChange={setTab} />

      {visible.length === 0 ? (
        <EmptyState
          title={tab === "ALL" ? "Your library is empty" : "Nothing on this shelf"}
          description="Use “Add to library” on any game page to put it on a shelf."
          actionLabel="Browse the catalogue"
          actionHref="/games"
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
          {visible.map((game) => {
            const cover = coverUrl(game.cover);
            return (
              <div key={game.id} className="flex min-w-0 flex-col gap-2.5">
                <Link href={`/games/${game.slug}`} className="group flex flex-col gap-2.5">
                  <span className="ov-chamfer block aspect-[3/4] overflow-hidden bg-ov-raised">
                    {cover && (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 1080px) 220px, 45vw"
                        className="object-cover transition-[filter] duration-200 group-hover:brightness-110"
                      />
                    )}
                  </span>
                  <span className="flex justify-between gap-2">
                    <span className="truncate text-body font-semibold text-ov-white">{game.name}</span>
                    <Rating value={game.aggregated_rating} className="text-ui" />
                  </span>
                </Link>
                {game.id && <ShelfMenu gameId={game.id} gameName={game.name} size="sm" className="w-full" />}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
