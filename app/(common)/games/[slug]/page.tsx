import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGame } from "@/lib/games";
import { GameView } from "@/components/overdrive/GameView";
import { formatYear } from "@/utils/overdrive";

type Props = { params: Promise<{ slug: string }> };

// Rendered on first visit, then served from cache and regenerated in the
// background at most every 5 minutes (prices change hourly at most). The
// render is read-only; views are recorded by a beacon from GameView.
export const revalidate = 300;

// None are pre-built; an empty list (vs. no export) is what tells Next to
// cache each game page after its first visit instead of rendering per request.
export function generateStaticParams() {
  return [];
}

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
