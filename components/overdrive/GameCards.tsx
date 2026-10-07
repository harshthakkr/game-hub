"use client";

import { useCollection } from "@/context/CollectionContext";
import { GameCardProps } from "@/utils/types";
import {
  coverUrl,
  developerName,
  formatYear,
  gameTag,
} from "@/utils/overdrive";
import Image from "next/image";
import Link from "next/link";
import { OvIcon } from "./OvIcon";

/// Wishlist toggle laid over a cover or row. It sits beside the card's link,
/// never inside it: a button nested in an <a> is invalid and breaks focus order.
function WishButton({
  gameId,
  gameName,
  className = "",
  iconClassName = "",
}: {
  gameId: number;
  gameName: string;
  className?: string;
  iconClassName?: string;
}) {
  const { isWished, toggleWish } = useCollection();
  const wished = isWished(gameId);
  return (
    <button
      type="button"
      onClick={() => toggleWish(gameId)}
      aria-pressed={wished}
      aria-label={wished ? `Remove ${gameName} from wishlist` : `Add ${gameName} to wishlist`}
      className={`z-10 transition-transform duration-150 hover:scale-110 active:scale-90 ${className}`}
    >
      <OvIcon
        name={wished ? "heart-filled" : "heart"}
        className={`transition-colors duration-150 ${
          wished ? "text-ov-rose" : "text-white/70"
        } ${iconClassName}`}
      />
    </button>
  );
}

export function GameGridCard({ game }: { game: GameCardProps }) {
  const cover = coverUrl(game.cover);
  const tag = gameTag(game.genres, game.hypes);

  return (
    <div className="group relative">
      <Link href={`/games/${game.slug}`} className="block">
        <div className="ov-chamfer aspect-[3/4] overflow-hidden border border-ov-border bg-ov-panel transition-all duration-200 group-hover:-translate-y-1.5 group-hover:border-ov-teal">
          {cover ? (
            <Image
              src={cover}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="220px"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-teal-700 to-slate-900" />
          )}
          {tag && (
            <span className="absolute left-2 top-2 bg-ov-teal px-1.5 py-0.5 text-micro tracking-wide text-ov-bg">
              {tag}
            </span>
          )}
        </div>
        <div className="mt-2 text-body font-semibold text-white transition-colors duration-150 group-hover:text-ov-teal">
          {game.name}
        </div>
        <div className="mt-0.5 text-label uppercase tracking-wide text-ov-muted">
          {formatYear(game.first_release_date)}
        </div>
      </Link>
      {game.id && (
        <WishButton
          gameId={game.id}
          gameName={game.name}
          className="absolute right-2 top-2 group-hover:-translate-y-1.5"
          iconClassName="text-body drop-shadow-[0_1px_4px_rgb(0_0_0/0.6)]"
        />
      )}
    </div>
  );
}

export function GameListRow({ game }: { game: GameCardProps }) {
  const { isInLibrary, toggleLibrary } = useCollection();
  const cover = coverUrl(game.cover);
  const inLib = game.id ? isInLibrary(game.id) : false;
  const dev = developerName(game.involved_companies);
  const tag = gameTag(game.genres, game.hypes);

  // The title link stretches over the whole row (its ::before), so the row is
  // one click target while the buttons stay separate, focusable siblings.
  return (
    <div className="group ov-chamfer ov-chamfer-sm flex items-center gap-4 border border-ov-border bg-ov-panel px-4 py-3 transition-colors duration-150 hover:border-ov-teal has-[a:focus-visible]:border-ov-teal has-[a:focus-visible]:bg-ov-raised">
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
          {dev} · {formatYear(game.first_release_date)}
        </div>
      </div>
      {tag && (
        <span className="bg-ov-teal px-2 py-0.5 text-micro tracking-wide text-ov-bg">
          {tag}
        </span>
      )}
      {game.id && (
        <>
          <WishButton gameId={game.id} gameName={game.name} className="relative" iconClassName="text-lg" />
          <button
            type="button"
            onClick={() => toggleLibrary(game.id!)}
            aria-pressed={inLib}
            className={`relative z-10 flex items-center gap-1 border bg-transparent px-3 py-[7px] text-label tracking-hud transition-all duration-150 hover:brightness-125 active:scale-95 ${
              inLib ? "border-ov-teal text-ov-teal" : "border-ov-muted text-ov-muted"
            }`}
          >
            <OvIcon name={inLib ? "check" : "plus"} className="text-xs" />
            {inLib ? "IN LIB" : "LIB"}
          </button>
        </>
      )}
    </div>
  );
}
