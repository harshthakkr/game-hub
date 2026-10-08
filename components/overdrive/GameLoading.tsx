"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { heroPending, useHeroArrival } from "@/utils/heroNav";
import { GameDetailSkeleton } from "./Skeletons";

/// Loading screen for /games/[slug]. When a card started a hero transition
/// to this game, the skeleton shows its cover and title and signals arrival.
export function GameLoading() {
  const slug = usePathname().split("/")[2];
  const [game] = useState(() => heroPending(slug));
  useHeroArrival(game ? slug : undefined);
  return <GameDetailSkeleton game={game} />;
}
