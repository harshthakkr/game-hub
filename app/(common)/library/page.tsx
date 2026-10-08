"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loginHref, SHELVES, useCollection, type Shelf } from "@/context/CollectionContext";
import { useGamesByIds } from "@/utils/hooks/useGamesByIds";
import { PageContainer } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { LibrarySkeleton } from "@/components/overdrive/Skeletons";
import { ShelfMenu } from "@/components/overdrive/ShelfMenu";
import { ChipGroup, IconButton, PageHeading, Rating } from "@/components/ui";
import { SavedSwitcher } from "@/components/overdrive/SavedSwitcher";
import { useIsMobile } from "@/utils/hooks/useMediaQuery";
import { coverUrl } from "@/utils/overdrive";
import Image from "next/image";

type Tab = "ALL" | Shelf;

export default function LibraryPage() {
  const { library, shelfOf, setShelf, ready, signedIn } = useCollection();
  const isMobile = useIsMobile();
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
        <SavedSwitcher />
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
      <SavedSwitcher />
      <PageHeading
        title="Library"
        description="Shelve games by where you are with them."
      />
      <ChipGroup
        label="Shelf"
        variant="underline"
        options={tabs}
        value={tab}
        onValueChange={setTab}
        className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0"
      />

      {visible.length === 0 ? (
        <EmptyState
          title={tab === "ALL" ? "Your library is empty" : "Nothing on this shelf"}
          description="Use “Add to library” on any game page to put it on a shelf."
          actionLabel="Browse the catalogue"
          actionHref="/games"
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:gap-x-5 lg:gap-y-7">
          {visible.map((game) => {
            const cover = coverUrl(game.cover);
            return (
              <div key={game.id} className="relative flex min-w-0 flex-col gap-2.5">
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
                    <span className="line-clamp-2 min-h-9 text-sm leading-snug font-semibold text-ov-white lg:text-body">
                      {game.name}
                    </span>
                    <Rating value={game.aggregated_rating} className="text-ui" />
                  </span>
                </Link>
                {game.id &&
                  (isMobile ? (
                    <ShelfMenu gameId={game.id} gameName={game.name} className="w-full" />
                  ) : (
                    <>
                      {/* Desktop: a three-way shelf control; remove sits on the cover. */}
                      <ChipGroup
                        label={`Shelf for ${game.name}`}
                        variant="segmented"
                        options={SHELVES.map((x) => ({ value: x.value, label: x.label }))}
                        value={shelfOf(game.id) ?? "BACKLOG"}
                        onValueChange={(v) => setShelf(game.id!, v)}
                        className="w-full [&>*]:flex-1 [&>*]:justify-center [&>*]:px-1"
                      />
                      <IconButton
                        variant="overlay"
                        icon="trash"
                        label={`Remove ${game.name} from library`}
                        onClick={() => setShelf(game.id!, null)}
                        className="absolute top-2.5 right-2.5"
                        iconClassName="text-sm"
                      />
                    </>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
