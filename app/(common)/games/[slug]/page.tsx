import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { GameView } from "@/components/overdrive/GameView";
import { formatYear } from "@/utils/overdrive";

type Props = { params: Promise<{ slug: string }> };

function describe(game: NonNullable<Awaited<ReturnType<typeof getGame>>>) {
  const summary = game.summary ?? game.storyline ?? "";
  const clipped = summary.length > 155 ? `${summary.slice(0, 152).trimEnd()}…` : summary;
  return clipped || `${game.name}: prices, reviews and release details on GAME//HUB.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) return { title: "Game not found" };
  const year = formatYear(game.first_release_date);
  return {
    title: year ? `${game.name} (${year})` : game.name,
    description: describe(game),
    alternates: { canonical: `/games/${slug}` },
    openGraph: {
      type: "website",
      title: game.name,
      description: describe(game),
    },
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const game = await getGame(slug);
  if (!game) notFound();
  return <GameView key={slug} data={game} slug={slug} />;
}
