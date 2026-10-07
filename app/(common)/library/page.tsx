"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { loginHref, useCollection } from "@/context/CollectionContext";
import { GameCardProps } from "@/utils/types";
import { PageContainer, PageTitle } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { LibrarySkeleton } from "@/components/overdrive/Skeletons";
import { GameListRow } from "@/components/overdrive/GameCards";
import { Button } from "@/components/ui";
import { developerName } from "@/utils/overdrive";

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
          {games.map((game) => (
            <GameListRow
              key={game.id}
              game={game}
              meta={`${developerName(game.involved_companies)} · ${game.genres?.[0]?.name || "Game"}`}
              actions={
                game.id && (
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label={`Remove ${game.name} from library`}
                    onClick={() => toggleLibrary(game.id!)}
                    className="relative z-10"
                  >
                    REMOVE
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

