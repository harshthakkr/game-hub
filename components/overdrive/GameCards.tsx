"use client";

import Image from "next/image";
import Link from "next/link";
import { useCollection } from "@/context/CollectionContext";
import { GameCardProps } from "@/utils/types";
import { coverUrl, developerName, formatYear } from "@/utils/overdrive";
import { discountLabel, saleNote, STORE_SHORT } from "@/utils/price";
import { IconButton, Price, Rating, Tag } from "@/components/ui";
import { cx } from "@/utils/cx";
import { ShelfMenu } from "./ShelfMenu";

/// Wishlist toggle laid over a cover or row. It sits beside the card's link,
/// never inside it: a button nested in an <a> is invalid and breaks focus order.
export function WishButton({
  gameId,
  gameName,
  variant = "overlay",
  className,
}: {
  gameId: number;
  gameName: string;
  variant?: "overlay" | "ghost";
  className?: string;
}) {
  const { isWished, toggleWish } = useCollection();
  const wished = isWished(gameId);
  return (
    <IconButton
      variant={variant}
      icon={wished ? "heart-filled" : "heart"}
      label={wished ? `Remove ${gameName} from wishlist` : `Add ${gameName} to wishlist`}
      aria-pressed={wished}
      onClick={() => toggleWish(gameId)}
      className={cx("z-10", className)}
    />
  );
}

/// Portrait cover with the cut corner; the parent supplies the link.
function Cover({
  game,
  sizes,
  className,
  children,
}: {
  game: GameCardProps;
  sizes: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const cover = coverUrl(game.cover);
  return (
    <div className={cx("ov-chamfer aspect-[3/4] overflow-hidden bg-ov-raised", className)}>
      {cover && (
        <Image
          src={cover}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-[filter] duration-200 group-hover:brightness-110"
        />
      )}
      {children}
    </div>
  );
}

function PriceText({ game, className }: { game: GameCardProps; className?: string }) {
  if (!game.price) return null;
  return (
    <span
      title={`Best price, on ${game.price.storeLabel}`}
      className={cx("whitespace-nowrap font-orbitron font-bold text-ov-white", className)}
    >
      {game.price.current}
    </span>
  );
}

/// Grid tile: cover (wishlist heart, discount badge), title with the critic
/// score, then year · genre and the best tracked price.
export function GameGridCard({ game, showRating = true }: { game: GameCardProps; showRating?: boolean }) {
  const discount = discountLabel(game.price);
  return (
    <div className="group relative flex min-w-0 flex-col gap-3">
      <Link href={`/games/${game.slug}`} className="flex flex-col gap-3 outline-offset-4">
        <Cover game={game} sizes="(min-width: 1080px) 220px, 45vw">
          {discount && (
            <Tag tone="deal" size="badge" className="absolute bottom-0 left-0">
              {discount}
            </Tag>
          )}
        </Cover>
        <span className="flex items-start justify-between gap-2.5">
          <span className="line-clamp-2 text-body font-semibold leading-snug text-ov-white">
            {game.name}
          </span>
          {showRating && <Rating value={game.aggregated_rating} boxed />}
        </span>
      </Link>
      <div className="-mt-1.5 flex items-baseline gap-2 text-ui text-ov-muted">
        <span>{formatYear(game.first_release_date) || "TBA"}</span>
        {game.genres?.[0] && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">{game.genres[0].name}</span>
          </>
        )}
        <PriceText game={game} className="ml-auto text-ui" />
      </div>
      {game.id && (
        <WishButton gameId={game.id} gameName={game.name} className="absolute top-2.5 right-2.5" />
      )}
    </div>
  );
}

/// Trending tile: cover with a rank badge, title, year · genre, score.
export function RankedCard({ game, rank }: { game: GameCardProps; rank: number }) {
  return (
    <Link href={`/games/${game.slug}`} className="group flex min-w-0 flex-col gap-3">
      <Cover game={game} sizes="(min-width: 1080px) 200px, 40vw">
        <span className="absolute top-0 left-0 bg-ov-bg px-2.5 py-1.5 font-orbitron text-ui font-bold text-ov-white">
          <span className="sr-only">Rank </span>#{rank}
        </span>
      </Cover>
      <span className="flex justify-between gap-2.5">
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-body font-semibold text-ov-white">{game.name}</span>
          <span className="truncate text-ui text-ov-muted">
            {[formatYear(game.first_release_date) || "TBA", game.genres?.[0]?.name]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <Rating value={game.aggregated_rating} boxed className="h-max" />
      </span>
    </Link>
  );
}

/// Sale tile for the price-drops shelf: cover with discount, price and note.
export function DealCard({ game }: { game: GameCardProps }) {
  const price = game.price!;
  return (
    <div className="group relative flex min-w-0 flex-col gap-3">
      <Link href={`/games/${game.slug}`} className="flex flex-col gap-3">
        <Cover game={game} sizes="(min-width: 1080px) 200px, 40vw">
          <Tag tone="deal" size="badge" className="absolute bottom-0 left-0">
            {discountLabel(price)}
          </Tag>
        </Cover>
        <span className="truncate text-body font-semibold text-ov-white">{game.name}</span>
      </Link>
      <div className="-mt-1.5 flex flex-col gap-1">
        <Price current={price.current} original={price.original} />
        <span className="text-label text-ov-deal">
          {saleNote(price)} · {STORE_SHORT[price.store]}
        </span>
      </div>
      {game.id && (
        <WishButton gameId={game.id} gameName={game.name} className="absolute top-2.5 right-2.5" />
      )}
    </div>
  );
}

/// Ranked list row (trending on phones): rank, thumb, title, meta, score.
export function RankedRow({ game, rank }: { game: GameCardProps; rank: number }) {
  const cover = coverUrl(game.cover);
  return (
    <Link
      href={`/games/${game.slug}`}
      className="grid min-h-[84px] grid-cols-[28px_48px_minmax(0,1fr)_auto] items-center gap-3 border-b border-ov-raised py-2.5"
    >
      <span className="font-orbitron text-sm font-bold text-ov-muted">
        <span className="sr-only">Rank </span>
        {rank}
      </span>
      {cover ? (
        <Image src={cover} alt="" width={48} height={64} className="h-16 w-12 object-cover" />
      ) : (
        <span className="h-16 w-12 bg-ov-raised" />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-body leading-snug font-semibold text-ov-white">{game.name}</span>
        <span className="truncate text-ui text-ov-muted">
          {[formatYear(game.first_release_date) || "TBA", game.genres?.[0]?.name].filter(Boolean).join(" · ")}
        </span>
      </span>
      <Rating value={game.aggregated_rating} boxed />
    </Link>
  );
}

/// Dense row for lists (new releases): thumb, title, meta, score, price, heart.
export function CompactRow({ game, meta }: { game: GameCardProps; meta?: string }) {
  const cover = coverUrl(game.cover);
  return (
    <div className="group relative grid grid-cols-[48px_minmax(0,1fr)_auto_36px] items-center gap-x-4 border-b border-ov-raised px-2 py-2.5 transition-colors duration-150 hover:bg-ov-panel has-[a:focus-visible]:bg-ov-panel md:grid-cols-[48px_minmax(0,1fr)_44px_84px_36px]">
      {cover ? (
        <Image src={cover} alt="" width={48} height={64} className="h-16 w-12 object-cover" />
      ) : (
        <span className="h-16 w-12 bg-ov-raised" />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <Link
          href={`/games/${game.slug}`}
          className="truncate text-body font-semibold text-ov-white outline-none before:absolute before:inset-0"
        >
          {game.name}
        </Link>
        <span className="truncate text-ui text-ov-muted">
          {meta ?? developerName(game.involved_companies)}
        </span>
      </span>
      <Rating value={game.aggregated_rating} className="hidden text-body md:block" />
      <span className="text-right text-body">
        {game.price ? (
          <PriceText game={game} />
        ) : (
          <span className="text-label text-ov-muted">No price yet</span>
        )}
      </span>
      {game.id && (
        <WishButton variant="ghost" gameId={game.id} gameName={game.name} className="relative" />
      )}
    </div>
  );
}

/// Catalogue list view row: a table-like line with genre, score, price and
/// the wishlist/library actions. The title link stretches over the row.
export function GameListRow({ game }: { game: GameCardProps }) {
  const cover = coverUrl(game.cover);
  const discount = discountLabel(game.price);
  return (
    <div className="group relative grid grid-cols-[48px_minmax(0,1fr)_auto_36px] items-center gap-x-3 border-t border-ov-raised px-2.5 py-2.5 lg:gap-x-4 transition-colors duration-150 hover:bg-ov-panel has-[a:focus-visible]:bg-ov-panel lg:grid-cols-[48px_minmax(0,1fr)_120px_52px_110px_36px_150px]">
      {cover ? (
        <Image src={cover} alt="" width={48} height={64} className="h-16 w-12 object-cover" />
      ) : (
        <span className="h-16 w-12 bg-ov-raised" />
      )}
      <span className="flex min-w-0 flex-col gap-1">
        <Link
          href={`/games/${game.slug}`}
          className="truncate text-body font-semibold text-ov-white outline-none before:absolute before:inset-0"
        >
          {game.name}
        </Link>
        <span className="truncate text-ui text-ov-muted">
          {[developerName(game.involved_companies), formatYear(game.first_release_date)]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      {/* Phones: score and best price stacked at the end of the row. */}
      <span className="flex flex-col items-end gap-1.5 lg:hidden">
        <Rating value={game.aggregated_rating} className="text-ui" />
        {game.price && (
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            {discount && (
              <Tag tone="deal" size="sm">
                {discount}
              </Tag>
            )}
            <span className="font-orbitron text-ui font-bold">{game.price.current}</span>
          </span>
        )}
      </span>
      <span className="hidden truncate text-ui text-ov-text lg:block">{game.genres?.[0]?.name}</span>
      <Rating value={game.aggregated_rating} className="hidden text-body lg:block" />
      <span className="hidden flex-col items-end gap-0.5 lg:flex">
        {game.price ? (
          <>
            <PriceText game={game} className="text-body" />
            {discount && (
              <span className="text-label text-ov-deal">
                {discount}
                {game.price.original && (
                  <>
                    {" · "}
                    <s className="text-ov-muted">{game.price.original}</s>
                  </>
                )}
              </span>
            )}
          </>
        ) : (
          <span className="text-label text-ov-muted">—</span>
        )}
      </span>
      {game.id && (
        <WishButton variant="ghost" gameId={game.id} gameName={game.name} className="relative" />
      )}
      {game.id && (
        <div className="relative z-10 hidden justify-end lg:flex">
          <ShelfMenu gameId={game.id} gameName={game.name} size="sm" />
        </div>
      )}
    </div>
  );
}

/// Phone wishlist row: thumb, title, best price with store mark and sale
/// badge, a note, and the remove (heart) button.
export function WishlistRow({ game }: { game: GameCardProps }) {
  const cover = coverUrl(game.cover);
  const discount = discountLabel(game.price);
  const note = saleNote(game.price);
  return (
    <div className="relative grid grid-cols-[60px_minmax(0,1fr)_44px] items-center gap-3 border-b border-ov-raised py-3 pr-1.5 pl-4">
      {cover ? (
        <Image src={cover} alt="" width={60} height={80} className="h-20 w-[60px] object-cover" />
      ) : (
        <span className="h-20 w-[60px] bg-ov-raised" />
      )}
      <span className="flex min-w-0 flex-col gap-1.5">
        <Link
          href={`/games/${game.slug}`}
          className="line-clamp-2 text-body leading-snug font-semibold text-ov-white outline-none before:absolute before:inset-0"
        >
          {game.name}
        </Link>
        {game.price ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {discount && (
              <Tag tone="deal" size="sm">
                {discount}
              </Tag>
            )}
            <span className="font-orbitron text-body font-bold">{game.price.current}</span>
            <span className="border border-ov-border-strong px-1 font-mono text-[10px] text-ov-dim">
              {STORE_SHORT[game.price.store].toUpperCase()}
            </span>
            {game.price.original && <s className="text-label text-ov-muted">{game.price.original}</s>}
          </span>
        ) : (
          <span className="text-ui text-ov-muted">No price yet</span>
        )}
        <span className={cx("text-label", note ? "text-ov-deal" : "text-ov-muted")}>
          {note ?? (game.price ? "Tracking · no change" : "Checked hourly once it's on a store")}
        </span>
      </span>
      {game.id && <WishButton variant="ghost" gameId={game.id} gameName={game.name} className="relative" />}
    </div>
  );
}

/// Small horizontal card (wishlist panel on Discover).
export function MiniCard({ game, note, noteTone = "muted" }: {
  game: GameCardProps;
  note?: string | null;
  noteTone?: "muted" | "deal";
}) {
  const cover = coverUrl(game.cover);
  return (
    <Link
      href={`/games/${game.slug}`}
      className="flex gap-3.5 border border-ov-border bg-ov-panel p-3 transition-colors duration-150 hover:border-ov-border-strong"
    >
      {cover ? (
        <Image src={cover} alt="" width={56} height={75} className="h-[75px] w-14 shrink-0 object-cover" />
      ) : (
        <span className="h-[75px] w-14 shrink-0 bg-ov-raised" />
      )}
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="truncate text-body font-semibold text-ov-white">{game.name}</span>
        {game.price ? (
          <span className="font-orbitron text-sm font-bold text-ov-white">{game.price.current}</span>
        ) : (
          <span className="text-ui text-ov-muted">No price yet</span>
        )}
        {note && (
          <span className={cx("text-label", noteTone === "deal" ? "text-ov-deal" : "text-ov-muted")}>
            {note}
          </span>
        )}
      </span>
    </Link>
  );
}
