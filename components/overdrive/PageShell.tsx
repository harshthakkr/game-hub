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

/// Standard page frame: the shared max width and gutters, with room for the
/// page's own vertical rhythm.
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "mx-auto flex max-w-[1440px] flex-col gap-7 px-4 pt-8 pb-24 md:px-8 md:pt-10",
        className
      )}
    >
      {children}
    </div>
  );
}
