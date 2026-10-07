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
import { Button, IconButton, Tag } from "@/components/ui";
import { cx } from "@/utils/cx";

/// Wishlist toggle laid over a cover or row. It sits beside the card's link,
/// never inside it: a button nested in an <a> is invalid and breaks focus order.
export function WishButton({
  gameId,
  gameName,
  className,
  iconClassName,
}: {
  gameId: number;
  gameName: string;
  className?: string;
  iconClassName?: string;
}) {
  const { isWished, toggleWish } = useCollection();
  const wished = isWished(gameId);
  return (
    <IconButton
      variant="overlay"
      icon={wished ? "heart-filled" : "heart"}
      label={wished ? `Remove ${gameName} from wishlist` : `Add ${gameName} to wishlist`}
      aria-pressed={wished}
      onClick={() => toggleWish(gameId)}
      className={cx("z-10", className)}
      iconClassName={iconClassName}
    />
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
            <Tag tone="teal" variant="solid" size="sm" className="absolute left-2 top-2">
              {tag}
            </Tag>
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
          iconClassName="text-body"
        />
      )}
    </div>
  );
}

/// Wishlist and library toggles: a list row's default actions.
function CollectionActions({ game }: { game: GameCardProps }) {
  const { isInLibrary, toggleLibrary } = useCollection();
  if (!game.id) return null;
  const inLib = isInLibrary(game.id);
  return (
    <>
      <WishButton gameId={game.id} gameName={game.name} className="relative" iconClassName="text-lg" />
      <Button
        size="sm"
        variant={inLib ? "secondary" : "outline"}
        icon={inLib ? "check" : "plus"}
        aria-pressed={inLib}
        aria-label={inLib ? `Remove ${game.name} from library` : `Add ${game.name} to library`}
        onClick={() => toggleLibrary(game.id!)}
        className="relative z-10"
      >
        {inLib ? "IN LIB" : "LIB"}
      </Button>
    </>
  );
}

export function GameListRow({
  game,
  meta,
  actions,
}: {
  game: GameCardProps;
  /// Secondary line; defaults to "developer · year".
  meta?: string;
  /// Trailing controls; defaults to the wishlist and library toggles. They
  /// need `relative z-10` to sit above the row-wide link.
  actions?: React.ReactNode;
}) {
  const cover = coverUrl(game.cover);
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
          {meta ?? `${developerName(game.involved_companies)} · ${formatYear(game.first_release_date)}`}
        </div>
      </div>
      {tag && (
        <Tag tone="teal" variant="solid" size="sm">
          {tag}
        </Tag>
      )}
      {actions ?? <CollectionActions game={game} />}
    </div>
  );
}
