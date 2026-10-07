function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[1px] border border-ov-border bg-ov-raised ${className}`}
    />
  );
}

export function GamesSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-6">
      <div className="flex flex-wrap gap-7">
        <aside className="w-full shrink-0 space-y-4 lg:w-[210px]">
          <Bone className="h-4 w-20" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-7 w-14" />
            ))}
          </div>
          <Bone className="h-4 w-16" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-4 w-28" />
            ))}
          </div>
          <Bone className="h-24 w-full" />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-3">
            <Bone className="h-5 w-32" />
            <Bone className="ml-auto h-7 w-16" />
            <Bone className="h-7 w-16" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Bone className="ov-chamfer aspect-[3/4] w-full" />
                <Bone className="mt-2 h-4 w-[75%]" />
                <Bone className="mt-1.5 h-3 w-[50%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] pb-[60px]">
      <Bone className="h-[280px] w-full lg:h-[340px]" />
      <div className="flex flex-wrap gap-[26px] px-4 py-[26px] lg:px-6">
        <div className="min-w-[280px] flex-1 space-y-4">
          <div className="flex gap-2 border-b border-ov-border pb-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Bone key={i} className="h-8 w-24" />
            ))}
          </div>
          <Bone className="h-4 w-16" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-[80%]" />
          <div className="flex gap-3 pt-2">
            <Bone className="h-11 w-28" />
            <Bone className="h-11 w-32" />
            <Bone className="h-11 w-32" />
          </div>
        </div>
        <Bone className="ov-chamfer-x h-64 w-full lg:w-[300px]" />
      </div>
      <div className="px-4 lg:px-6">
        <Bone className="mb-4 h-4 w-36" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Bone className="ov-chamfer aspect-[3/4] w-full" />
              <Bone className="mt-2 h-4 w-[75%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-5 flex items-baseline gap-3">
        <Bone className="h-8 w-48" />
        <Bone className="h-4 w-40" />
        <Bone className="ml-auto h-7 w-20" />
      </div>
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-7 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="ov-chamfer overflow-hidden border border-ov-border">
            <Bone className="h-[150px] w-full border-0" />
            <div className="space-y-2 p-3.5">
              <Bone className="h-4 w-full" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <Bone className="mb-5 h-9 w-40" />
      <div className="flex flex-wrap gap-7">
        <Bone className="ov-chamfer ov-chamfer-lg h-[240px] max-w-[440px] min-w-[280px] flex-1" />
        <div className="min-w-[280px] flex-1 space-y-4">
          <Bone className="h-8 w-[75%]" />
          <div className="flex gap-5">
            <Bone className="h-12 w-28" />
            <Bone className="h-12 w-28" />
            <Bone className="h-12 w-24" />
          </div>
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-[83%]" />
          <div className="flex gap-3 pt-2">
            <Bone className="h-11 w-36" />
            <Bone className="h-11 w-36" />
          </div>
        </div>
      </div>
      <Bone className="mb-4 mt-10 h-4 w-40" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Bone className="ov-chamfer aspect-[3/4] w-full" />
            <Bone className="mt-2 h-4 w-[75%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformsSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-8 w-44" />
        <Bone className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="ov-chamfer border border-ov-border bg-ov-panel p-[18px]">
            <Bone className="mb-3.5 h-[38px] w-[38px]" />
            <Bone className="h-4 w-[75%]" />
            <Bone className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenresSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-8 w-36" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Bone key={i} className="h-[88px] w-full" />
        ))}
      </div>
    </div>
  );
}

export function DevelopersSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-8 w-48" />
        <Bone className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="ov-chamfer ov-chamfer-sm flex items-center gap-3.5 border border-ov-border bg-ov-panel p-4"
          >
            <Bone className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-[75%]" />
              <Bone className="h-3 w-[50%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeveloperDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-start gap-4">
        <Bone className="h-14 w-14 shrink-0" />
        <div className="space-y-2">
          <Bone className="h-8 w-56" />
          <Bone className="h-4 w-32" />
        </div>
      </div>
      <Bone className="mb-3 h-4 w-48" />
      <Bone className="mb-8 h-4 w-full max-w-[720px]" />
      <Bone className="mb-4 h-4 w-40" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Bone className="ov-chamfer aspect-[3/4] w-full" />
            <Bone className="mt-2 h-4 w-[75%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatalogueSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-8 w-52" />
        <Bone className="h-4 w-36" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Bone className="ov-chamfer aspect-[3/4] w-full" />
            <Bone className="mt-2 h-4 w-[75%]" />
            <Bone className="mt-1.5 h-3 w-[50%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-7 w-28" />
        <Bone className="h-4 w-40" />
        <Bone className="ml-auto h-4 w-20" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Bone className="ov-chamfer aspect-[3/4] w-full" />
            <Bone className="mt-2 h-4 w-[75%]" />
            <Bone className="mt-1.5 h-3 w-[50%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WishlistSkeleton() {
  return <CatalogueSkeleton />;
}

export function LibrarySkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      <div className="mb-6 flex items-baseline gap-3">
        <Bone className="h-8 w-40" />
        <Bone className="h-4 w-32" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="ov-chamfer ov-chamfer-sm flex items-center gap-4 border border-ov-border bg-ov-panel px-4 py-3"
          >
            <Bone className="h-[60px] w-[46px] shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-[50%]" />
              <Bone className="h-3 w-[33%]" />
            </div>
            <Bone className="h-6 w-20" />
            <Bone className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--ov-topbar-h))] max-w-[900px] flex-col px-4 py-7 lg:px-6">
      <div className="mb-[18px] flex items-center gap-3">
        <Bone className="h-6 w-48" />
        <Bone className="h-6 w-20" />
      </div>
      <div className="ov-chamfer ov-chamfer-lg flex flex-1 flex-col gap-5 border border-ov-border bg-ov-sunken p-6">
        <Bone className="ml-auto h-16 w-[60%]" />
        <Bone className="h-24 w-[70%]" />
        <Bone className="ml-auto h-12 w-[45%]" />
        <Bone className="h-20 w-[65%]" />
      </div>
      <div className="my-3.5 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone key={i} className="h-8 w-36" />
        ))}
      </div>
      <Bone className="ov-chamfer-x h-14 w-full" />
    </div>
  );
}

export function ReviewListSkeleton() {
  return (
    <div className="mt-4 divide-y divide-ov-border border-t border-ov-border">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="py-5">
          <div className="flex items-start gap-3">
            <Bone className="ov-chamfer-x ov-chamfer-sm h-[38px] w-[38px] shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="ov-chamfer-x ov-chamfer-sm h-6 w-24 shrink-0" />
          </div>
          <div className="mt-3.5 space-y-2">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-[70%]" />
          </div>
          <div className="mt-3.5 flex gap-5">
            <Bone className="h-4 w-12" />
            <Bone className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Append-while-loading placeholders -------------------------------------
// These drop straight into an existing grid so a "load more" fetch grows the
// list with content-shaped bones instead of a detached spinner.

export function GameTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`tile-${i}`}>
          <Bone className="ov-chamfer aspect-[3/4] w-full" />
          <Bone className="mt-2 h-4 w-[75%]" />
          <Bone className="mt-1.5 h-3 w-[50%]" />
        </div>
      ))}
    </>
  );
}

export function EventTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`event-${i}`}
          className="ov-chamfer overflow-hidden border border-ov-border"
        >
          <Bone className="h-[130px] w-full border-0" />
          <div className="space-y-2 p-3.5">
            <Bone className="h-4 w-full" />
            <Bone className="h-3 w-24" />
          </div>
        </div>
      ))}
    </>
  );
}

export function PanelTileSkeletons({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`panel-${i}`}
          className="ov-chamfer ov-chamfer-sm flex items-center gap-3.5 border border-ov-border bg-ov-panel p-4"
        >
          <Bone className="h-11 w-11 shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-4 w-[70%]" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
      ))}
    </>
  );
}

/// Rows shaped like the top-bar search results, shown through the debounce and
/// request window so the dropdown never sits empty.
export function SearchResultsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`search-${i}`}
          className="flex items-center gap-3 border-b border-ov-border px-3 py-2.5"
        >
          <Bone className="h-10 w-[30px] shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Bone className="h-3 w-[70%]" />
            <Bone className="h-2.5 w-[40%]" />
          </div>
          <Bone className="h-3 w-6 shrink-0" />
        </div>
      ))}
    </div>
  );
}
