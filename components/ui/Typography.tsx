import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

/// Section heading in the HUD label style ("ABOUT", "SCREENSHOTS"). Renders a
/// real heading so the page outline is navigable by screen readers.
export function SectionLabel({
  children,
  as: Heading = "h2",
  tone = "rose",
  bar = false,
  className,
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  tone?: "rose" | "teal";
  /// Accent bar on the left, for sidebar group headings.
  bar?: boolean;
  className?: string;
}) {
  return (
    <Heading
      className={cx(
        "font-orbitron font-bold tracking-hud-wide",
        bar ? "border-l-[3px] pl-2 text-label" : "text-xs",
        tone === "rose" ? "border-ov-rose text-ov-rose" : "border-ov-teal text-ov-teal",
        className
      )}
    >
      {children}
    </Heading>
  );
}

/// Small uppercase caption that names a value or field group.
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("text-label tracking-wide text-ov-dim", className)}>{children}</div>
  );
}

/// Label/value pair: price summaries, event times, detail facts.
export function Stat({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 text-micro tracking-hud-wide text-ov-dim">{label}</div>
      <div className="font-orbitron text-sm font-bold text-ov-text">{children}</div>
    </div>
  );
}

/// Store price with an optional struck-through original for sales.
export function Price({
  current,
  original,
  size = "sm",
  className,
}: {
  current: string;
  original?: string | null;
  size?: "sm" | "xl";
  className?: string;
}) {
  return (
    <span className={cx("inline-flex flex-wrap items-baseline gap-2", className)}>
      {original && (
        <s className="text-label font-normal text-ov-muted">
          <span className="sr-only">Was </span>
          {original}
        </s>
      )}
      <span
        className={cx(
          "font-orbitron font-bold text-ov-teal",
          size === "xl" ? "text-xl" : "text-sm"
        )}
      >
        {original && <span className="sr-only">Now </span>}
        {current}
      </span>
    </span>
  );
}
