export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ov-grid-bg min-h-screen text-ov-text">
      {children}
    </div>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-[60px] pt-3 lg:px-6 lg:pt-7">
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  accent,
  accentClassName = "text-ov-teal",
  subtitle,
  badge,
}: {
  title: string;
  accent?: string;
  accentClassName?: string;
  subtitle?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-3 lg:mb-6">
      <h1 className="font-orbitron text-title font-black tracking-wide text-white">
        {title}
        {accent && <span className={accentClassName}>{accent}</span>}
      </h1>
      {subtitle && (
        <span className="text-sm text-ov-muted">// {subtitle}</span>
      )}
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );
}
