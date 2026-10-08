import { cx } from "@/utils/cx";

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

const GRID = "grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]";

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID}>
      <GameTileSkeletons count={count} />
    </div>
  );
}

export function DiscoverSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
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

export function GameDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mx-auto flex min-h-[540px] max-w-[1440px] flex-col justify-end gap-5 px-4 pb-10 md:px-8">
        <div className="flex flex-wrap items-end gap-8">
          <Bone className="ov-chamfer h-[267px] w-[200px]" />
          <div className="flex flex-1 flex-col gap-4">
            <Bone className="h-6 w-40" />
            <Bone className="h-12 w-[min(520px,90%)]" />
            <Bone className="h-4 w-48" />
            <div className="flex gap-3">
              <Bone className="h-12 w-32" />
              <Bone className="h-12 w-36" />
            </div>
          </div>
        </div>
      </div>
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
      <div className="grid gap-5 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
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
      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        <PanelTileSkeletons count={8} />
      </div>
    </Frame>
  );
}

export const PlatformsSkeleton = TileGridSkeleton;
export const GenresSkeleton = TileGridSkeleton;
export const DevelopersSkeleton = TileGridSkeleton;

export function ReviewListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading reviews" className="flex flex-col gap-6 pt-2">
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
    <div aria-busy="true" aria-label="Loading" className="mx-auto flex max-w-[880px] flex-col gap-5 px-4 pt-8 md:px-8">
      <Bone className="h-4 w-36" />
      <Bone className="h-24 w-4/5" />
      <Bone className="ml-auto h-12 w-1/2" />
    </div>
  );
}
