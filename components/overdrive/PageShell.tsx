import { cx } from "@/utils/cx";

/// App frame. Behind everything sits the HUD grid, pinned to the viewport
/// and fading out from the top: a screen you're looking through, rather than
/// a pattern printed on the page. `isolate` keeps the -z layer above the
/// frame's own background but below all content.
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="isolate min-h-screen bg-ov-bg text-ov-white">
      <div
        aria-hidden
        className="ov-grid-bg pointer-events-none fixed inset-0 -z-10 bg-transparent [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />
      {children}
    </div>
  );
}

/// Standard page frame: the shared max width, gutters and vertical rhythm.
/// `rhythm`: "blocks" (default) for a heading → toolbar → content page,
/// "sections" for a page made of sections (the style guide).
export function PageContainer({
  children,
  rhythm = "blocks",
  className,
}: {
  children: React.ReactNode;
  rhythm?: "blocks" | "sections";
  className?: string;
}) {
  return (
    <div
      className={cx(
        // Spacing roles (components/ui/Layout.tsx): gutter 16/32, page top
        // 20/40, bottom 48/96 (the phone tab bar's room is added by <main>),
        // and 24/32 between the page's blocks (40/64 between sections).
        "mx-auto flex max-w-[1440px] flex-col px-4 pt-5 pb-12 md:px-8 lg:pt-10 lg:pb-24",
        rhythm === "blocks" ? "gap-6 lg:gap-8" : "gap-10 lg:gap-16",
        className
      )}
    >
      {children}
    </div>
  );
}
