"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { loginHref, useCollection } from "@/context/CollectionContext";
import { GameCardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { LibrarySkeleton } from "@/components/overdrive/Skeletons";
import { coverUrl, developerName } from "@/utils/overdrive";

export default function LibraryPage() {
  const { library, toggleLibrary, ready, signedIn } = useCollection();
  const [games, setGames] = useState<GameCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (library.length === 0) {
      setGames([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`/api/games?ids=${library.join(",")}`)
      .then((res) => setGames(res.data))
      .finally(() => setLoading(false));
  }, [library, ready]);

  if (ready && !signedIn) {
    return (
      <PageContainer>
        <PageTitle title="LIBRARY" />
        <EmptyState
          icon="library"
          iconClassName="text-ov-teal"
          title="LOG IN TO SEE YOUR LIBRARY"
          description="Your library is saved to your account, so it follows you across devices."
          actionLabel="LOG IN"
          actionHref={loginHref("/library")}
        />
      </PageContainer>
    );
  }
  if (!ready || loading) return <LibrarySkeleton />;

  return (
    <PageContainer>
      <PageTitle title="LIBRARY" subtitle={`${library.length} in collection`} />

      {games.length === 0 ? (
        <EmptyState
          icon="library"
          iconClassName="text-ov-teal"
          title="NOTHING IN YOUR LIBRARY"
          description='Add games with "+ Library" to keep your collection in one place.'
          actionLabel="BROWSE GAMES"
          actionHref="/games"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {games.map((game) => {
            const cover = coverUrl(game.cover);
            return (
              // The title link stretches over the row (its ::before); the remove
              // button stays a sibling rather than nesting inside the <a>.
              <div
                key={game.id}
                className="group ov-chamfer ov-chamfer-sm flex items-center gap-4 border border-ov-border bg-ov-panel px-4 py-3 transition-colors duration-150 hover:border-ov-teal has-[a:focus-visible]:border-ov-teal has-[a:focus-visible]:bg-ov-raised"
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    width={46}
                    height={60}
                    className="h-[60px] w-[46px] shrink-0 border border-ov-border object-cover"
                  />
                ) : (
                  <div className="h-[60px] w-[46px] shrink-0 bg-linear-to-br from-teal-700 to-slate-900" />
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/games/${game.slug}`}
                    className="text-lg font-semibold text-white outline-none transition-colors duration-150 before:absolute before:inset-0 group-hover:text-ov-teal"
                  >
                    {game.name}
                  </Link>
                  <div className="mt-1 text-label uppercase tracking-wide text-ov-muted">
                    {developerName(game.involved_companies)} ·{" "}
                    {game.genres?.[0]?.name || "Game"}
                  </div>
                </div>
                <span className="border border-ov-teal px-2 py-0.5 text-micro tracking-wide text-ov-teal">
                  INSTALLED
                </span>
                {game.id && (
                  <button
                    type="button"
                    onClick={() => toggleLibrary(game.id!)}
                    aria-label={`Remove ${game.name} from library`}
                    className="relative z-10 border border-ov-rose px-3 py-1.5 text-label tracking-wide text-ov-rose transition-colors duration-150 hover:bg-ov-rose hover:text-ov-bg active:scale-95"
                  >
                    REMOVE
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

