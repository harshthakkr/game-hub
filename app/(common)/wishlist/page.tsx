"use client";

import { useMemo, useState } from "react";
import { useGamesByIds } from "@/utils/hooks/useGamesByIds";
import { loginHref, useCollection } from "@/context/CollectionContext";
import { PageContainer } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { WishlistSkeleton } from "@/components/overdrive/Skeletons";
import { GameGridCard } from "@/components/overdrive/GameCards";
import { ChipGroup, Eyebrow, PageHeading, StatStrip } from "@/components/ui";

const SORTS = [
  { value: "added", label: "Recently added" },
  { value: "discount", label: "Biggest discount" },
  { value: "price", label: "Lowest price" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function WishlistPage() {
  const { wishlist, ready, signedIn } = useCollection();
  const { games, loading } = useGamesByIds(wishlist, ready && signedIn);
  const [sort, setSort] = useState<Sort>("added");

  const sorted = useMemo(() => {
    if (sort === "added") return games;
    return [...games].sort((a, b) =>
      sort === "discount"
        ? (b.price?.discountPercent ?? -1) - (a.price?.discountPercent ?? -1)
        : (a.price?.amount ?? Infinity) - (b.price?.amount ?? Infinity)
    );
  }, [games, sort]);

  const onSale = games.filter((g) => (g.price?.discountPercent ?? 0) > 0);
  const saving = onSale.reduce((sum, g) => sum + Math.max(0, g.price!.baseAmount - g.price!.amount), 0);

  if (ready && !signedIn) {
    return (
      <PageContainer>
        <PageHeading title="Wishlist" />
        <EmptyState
          icon="heart"
          title="Sign in to see your wishlist"
          description="Your wishlist is saved to your account, so it follows you across devices."
          actionLabel="Sign in"
          actionHref={loginHref("/wishlist")}
        />
      </PageContainer>
    );
  }
  if (!ready || (loading && games.length === 0 && wishlist.length > 0)) return <WishlistSkeleton />;

  return (
    <PageContainer>
      <PageHeading
        title="Wishlist"
        description="Prices checked hourly on PlayStation Store and Steam."
      >
        {wishlist.length > 0 && (
          <StatStrip>
            <div className="flex flex-col gap-1">
              <Eyebrow>WISHLISTED</Eyebrow>
              <span className="font-orbitron text-[22px] font-bold">{wishlist.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Eyebrow>ON SALE</Eyebrow>
              <span className="font-orbitron text-[22px] font-bold text-ov-deal">{onSale.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <Eyebrow>YOU&apos;D SAVE</Eyebrow>
              <span className="font-orbitron text-[22px] font-bold text-ov-deal">{inr.format(saving)}</span>
            </div>
          </StatStrip>
        )}
      </PageHeading>

      {wishlist.length === 0 ? (
        <EmptyState
          icon="heart"
          title="Your wishlist is empty"
          description="Tap the heart on any game to track its price."
          actionLabel="Browse the catalogue"
          actionHref="/games"
        />
      ) : (
        <>
          <div className="flex justify-end border-b border-ov-border pb-3.5">
            <ChipGroup label="Sort wishlist" variant="segmented" options={SORTS} value={sort} onValueChange={setSort} />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {sorted.map((game) => (
              <GameGridCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
