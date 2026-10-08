"use client";

import { useMemo, useState } from "react";
import { useGamesByIds } from "@/utils/hooks/useGamesByIds";
import { loginHref, useCollection } from "@/context/CollectionContext";
import { PageContainer } from "@/components/overdrive/PageShell";
import { EmptyState } from "@/components/overdrive/EmptyState";
import { WishlistSkeleton } from "@/components/overdrive/Skeletons";
import { GameGridCard, WishlistRow } from "@/components/overdrive/GameCards";
import { SavedSwitcher } from "@/components/overdrive/SavedSwitcher";
import { useIsMobile } from "@/utils/hooks/useMediaQuery";
import { ChipGroup, Eyebrow, PageHeading, StatStrip, GAME_GRID } from "@/components/ui";

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
  const isMobile = useIsMobile();

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
        <SavedSwitcher />
        <PageHeading title="Wishlist" titleHiddenOnPhone />
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
      <SavedSwitcher />
      <PageHeading
        title="Wishlist"
        titleHiddenOnPhone
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
        // Sort sits with the list it sorts: 12px on phones, a page gap on desktop.
        <div className="flex flex-col gap-3 lg:gap-8">
          <div className="-mx-4 flex overflow-x-auto px-4 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:justify-end lg:border-b lg:border-ov-border lg:px-0 lg:pb-4">
            <ChipGroup label="Sort wishlist" variant="segmented" options={SORTS} value={sort} onValueChange={setSort} />
          </div>
          {isMobile ? (
            <div className="-mx-4 border-t border-ov-raised md:-mx-8">
              {sorted.map((game) => (
                <WishlistRow key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className={GAME_GRID}>
              {sorted.map((game) => (
                <GameGridCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
