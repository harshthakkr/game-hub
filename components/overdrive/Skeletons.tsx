import { cx } from "@/utils/cx";
import { GAME_GRID, tileGrid } from "@/components/ui/Layout";

/// Placeholder block with a slow left-to-right shimmer. Decorative: loading
/// regions announce themselves via aria-busy on their container instead.
function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        "animate-ov-shimmer bg-[linear-gradient(90deg,var(--color-ov-field)_0,var(--color-ov-raised)_40%,var(--color-ov-field)_80%)] bg-size-[800px_100%]",
        className
      )}
    />
  );
}

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cx("mx-auto flex max-w-[1440px] flex-col gap-7 px-4 pt-8 pb-24 md:px-8 md:pt-10", className)}
    >
      {children}
    </div>
  );
}

function HeadingBones() {
  return (
    <div className="flex flex-col gap-3">
      <Bone className="h-10 w-56" />
      <Bone className="h-4 w-80 max-w-full" />
    </div>
  );
}

export function GameTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Bone className="ov-chamfer aspect-[3/4]" />
          <Bone className="h-3.5 w-4/5" />
          <Bone className="h-3 w-2/5" />
        </div>
      ))}
    </>
  );
}

// Same grid as the real pages, so content lands where the bones were.
const GRID = GAME_GRID;

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID}>
      <GameTileSkeletons count={count} />
    </div>
  );
}

export function DiscoverSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading">
      <div className="mx-auto flex h-[560px] max-w-[1440px] flex-col justify-center gap-5 px-4 md:h-[600px] md:px-8">
        <Bone className="h-3 w-32" />
        <Bone className="h-14 w-[min(520px,90%)]" />
        <Bone className="h-4 w-60" />
        <Bone className="h-20 w-[min(560px,90%)]" />
        <div className="flex gap-3">
          <Bone className="h-12 w-44" />
          <Bone className="h-12 w-36" />
        </div>
      </div>
      <Frame className="pt-0">
        <Bone className="h-7 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Bone key={i} className="ov-chamfer h-[260px]" />
          ))}
        </div>
      </Frame>
    </div>
  );
}

export function CatalogueSkeleton() {
  return (
    <Frame>
      <HeadingBones />
      <GameGridSkeleton />
    </Frame>
  );
}

export const GamesSkeleton = CatalogueSkeleton;
export const SearchSkeleton = CatalogueSkeleton;
export const WishlistSkeleton = CatalogueSkeleton;
export const LibrarySkeleton = CatalogueSkeleton;
export const DeveloperDetailSkeleton = CatalogueSkeleton;

/// Game page placeholder, laid out like GameView's two heroes. Given the
/// game a card navigation is heading to, it paints that cover and title for
/// real, so the cover → hero transition lands on them before data arrives.
export function GameDetailSkeleton({ game }: { game?: { slug: string; name: string; cover: string | null } | null }) {
  const cover = game?.cover;
  return (
    <div role="status" aria-busy="true" aria-label="Loading" data-vt-hero={game?.slug}>
      <section className="lg:hidden">
        <div data-vt="cover" className="relative h-[236px] overflow-hidden bg-ov-panel md:h-[340px]">
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- the card's own loaded URL */}
              <img src={cover} alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-2xl" />
              <span className="ov-chamfer absolute top-5 left-4 h-[176px] w-[132px] overflow-hidden shadow-[0_16px_32px_rgb(0_0_0/0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="size-full object-cover" />
              </span>
            </>
          ) : (
            <Bone className="absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-ov-bg from-2% to-transparent to-55%" />
        </div>
        <div className="relative -mt-5 flex flex-col gap-3 px-4">
          <div className="flex gap-1.5">
            <Bone className="h-6 w-16" />
            <Bone className="h-6 w-20" />
          </div>
          {game ? (
            <div
              data-vt="title"
              className={cx(
                "leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ov-white",
                game.name.length > 40 ? "text-[22px]" : "text-[28px]"
              )}
            >
              {game.name}
            </div>
          ) : (
            <Bone className="h-8 w-3/4" />
          )}
          <Bone className="h-4 w-48" />
          <Bone className="h-[88px] w-full" />
        </div>
      </section>

      <section className="relative hidden min-h-[540px] overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgb(45_212_191/0.08),transparent_60%)]" />
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 px-4 pt-6 pb-10 md:px-8">
          <Bone className="h-8 w-28" />
          <div className="flex flex-wrap items-end gap-8">
            <div
              data-vt="cover"
              className="ov-chamfer relative hidden h-[267px] w-[200px] shrink-0 overflow-hidden border border-ov-border-strong md:block"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="size-full object-cover" />
              ) : (
                <Bone className="size-full" />
              )}
            </div>
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
              <div className="flex gap-2">
                <Bone className="h-7 w-20" />
                <Bone className="h-7 w-24" />
              </div>
              {game ? (
                <div
                  data-vt="title"
                  className="text-[36px] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ov-white md:text-display"
                >
                  {game.name}
                </div>
              ) : (
                <Bone className="h-12 w-[min(520px,90%)]" />
              )}
              <Bone className="h-5 w-48" />
              <div className="flex gap-3 pt-1.5">
                <Bone className="h-12 w-32" />
                <Bone className="h-12 w-36" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Frame>
        <div className="flex flex-wrap gap-14">
          <div className="flex min-w-[280px] flex-[999_1_560px] flex-col gap-4">
            <Bone className="h-6 w-24" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-11/12" />
            <Bone className="h-4 w-3/4" />
          </div>
          <Bone className="ov-chamfer h-[320px] flex-[1_1_320px]" />
        </div>
      </Frame>
    </div>
  );
}

export function EventTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} className="ov-chamfer h-[300px]" />
      ))}
    </>
  );
}

export function EventsSkeleton() {
  return (
    <Frame>
      <HeadingBones />
      <div className={tileGrid(280)}>
        <EventTileSkeletons count={6} />
      </div>
    </Frame>
  );
}

export function EventDetailSkeleton() {
  return (
    <Frame>
      <div className="flex flex-wrap gap-10">
        <Bone className="ov-chamfer aspect-video flex-[1_1_420px]" />
        <div className="flex flex-[1_1_420px] flex-col gap-4">
          <Bone className="h-4 w-24" />
          <Bone className="h-10 w-4/5" />
          <Bone className="h-16 w-full" />
        </div>
      </div>
    </Frame>
  );
}

export function PanelTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} className="ov-chamfer h-[140px]" />
      ))}
    </>
  );
}

function TileGridSkeleton() {
  return (
    <Frame>
      <HeadingBones />
      <div className={tileGrid(240, 2)}>
        <PanelTileSkeletons count={8} />
      </div>
    </Frame>
  );
}

export const PlatformsSkeleton = TileGridSkeleton;
/// Same grid and tile size as the genres page, so tiles land where the bones were.
export function GenresSkeleton() {
  return (
    <Frame>
      <HeadingBones />
      <div className={tileGrid(260, 2)}>
        {Array.from({ length: 12 }, (_, i) => (
          <Bone key={i} className="ov-chamfer h-[148px] lg:h-[168px]" />
        ))}
      </div>
    </Frame>
  );
}
export const DevelopersSkeleton = TileGridSkeleton;

export function ReviewListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading reviews" className="flex flex-col gap-6 pt-2">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 border-b border-ov-raised pb-5">
          <div className="flex items-center gap-2.5">
            <Bone className="size-8" />
            <Bone className="h-3.5 w-32" />
          </div>
          <Bone className="h-3.5 w-full" />
          <Bone className="h-3.5 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className="mx-auto flex max-w-[880px] flex-col gap-5 px-4 pt-8 md:px-8">
      <Bone className="h-4 w-36" />
      <Bone className="h-24 w-4/5" />
      <Bone className="ml-auto h-12 w-1/2" />
    </div>
  );
}
