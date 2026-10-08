import { cx } from "@/utils/cx";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ov-bg text-ov-white">{children}</div>;
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
