import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

/// Section heading with an optional mono index ("01") and a trailing action
/// link, ruled off from its content. Renders a real heading for the outline.
export function SectionHeader({
  title,
  index,
  meta,
  action,
  as: Heading = "h2",
  className,
}: {
  title: ReactNode;
  /// Two-digit position on the page, e.g. "01".
  index?: string;
  /// Quiet text after the title, e.g. "PlayStation Store India · hourly".
  meta?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-wrap items-baseline gap-x-2.5 gap-y-1 lg:gap-x-3.5 lg:border-b lg:border-ov-border lg:pb-3.5",
        className
      )}
    >
      {index && <span className="font-mono text-ui text-ov-muted">{index}</span>}
      <Heading className="text-lg font-semibold tracking-[-0.01em] text-ov-white lg:text-section">
        {title}
      </Heading>
      {meta && <span className="order-last w-full text-ui text-ov-muted lg:order-none lg:w-auto lg:text-sm">{meta}</span>}
      {action && <div className="ml-auto text-sm font-medium">{action}</div>}
    </div>
  );
}

/// Smaller in-content heading ("About", "Similar games").
export function SubHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx("text-xl font-semibold text-ov-white", className)}>{children}</h2>;
}

/// Page title block: big title plus a one-line description.
export function PageHeading({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /// Right-aligned extras (stats, actions).
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ov-white lg:text-page lg:tracking-[-0.03em]">
          {title}
        </h1>
        {description && <p className="text-sm text-ov-dim lg:text-body">{description}</p>}
      </div>
      {children && <div className="w-full lg:ml-auto lg:w-auto">{children}</div>}
    </div>
  );
}

/// Mono caps caption that names a value or field group ("CRITIC", "GENRE").
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("font-mono text-micro uppercase tracking-label text-ov-muted", className)}>
      {children}
    </div>
  );
}

/// Label over a big numeral: critic score, price, countdown.
export function Stat({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  /// Small line under the value, e.g. "35% of 551".
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <Eyebrow>{label}</Eyebrow>
      <div className="font-orbitron text-2xl font-bold text-ov-white">{children}</div>
      {hint && <div className="text-ui text-ov-dim">{hint}</div>}
    </div>
  );
}

/// A horizontal strip of stats divided by hairlines.
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "grid w-full auto-cols-fr grid-flow-col border border-ov-border bg-ov-panel/80 lg:flex lg:w-max lg:max-w-full lg:flex-wrap [&>*]:min-w-0 [&>*]:border-ov-border [&>*]:px-3 [&>*]:py-2.5 lg:[&>*]:px-5 lg:[&>*]:py-3 [&>*:not(:last-child)]:border-r",
        className
      )}
    >
      {children}
    </div>
  );
}

/// Store price with an optional struck-through original for sales.
export function Price({
  current,
  original,
  size = "md",
  className,
}: {
  current: string;
  original?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <span className={cx("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cx(
          "font-orbitron font-bold text-ov-white",
          { sm: "text-ui", md: "text-body", lg: "text-xl", xl: "text-[28px]" }[size]
        )}
      >
        {original && <span className="sr-only">Now </span>}
        {current}
      </span>
      {original && (
        <s className={cx("text-ov-muted", size === "xl" ? "text-body" : "text-ui")}>
          <span className="sr-only">was </span>
          {original}
        </s>
      )}
    </span>
  );
}

/// Critic score, colored by band: teal for 75+, neutral below, muted "TBA".
export function Rating({
  value,
  boxed = false,
  className,
}: {
  value?: number | null;
  boxed?: boolean;
  className?: string;
}) {
  const score = value ? Math.round(value) : null;
  return (
    <span
      aria-label={score ? `Critic score ${score}` : "Not yet rated"}
      className={cx(
        "shrink-0 font-orbitron font-bold",
        score === null ? "text-ov-muted" : score >= 75 ? "text-ov-teal" : "text-ov-dim",
        boxed &&
          cx(
            "border px-1.5 py-0.5 text-ui",
            score !== null && score >= 75 ? "border-ov-teal-deep" : "border-ov-border-strong"
          ),
        className
      )}
    >
      {score ?? "TBA"}
    </span>
  );
}
