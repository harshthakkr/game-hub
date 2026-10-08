"use client";

import axios from "axios";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { StoreId } from "@/utils/types";
import { OvIcon } from "./OvIcon";
import { Button, ChipGroup, Dialog, Eyebrow, Sheet, Tag } from "@/components/ui";
import { useIsMobile } from "@/utils/hooks/useMediaQuery";
import { cx } from "@/utils/cx";

const RANGES = [
  { value: "24h", label: "24H", hours: 24 },
  { value: "7d", label: "7D", hours: 24 * 7 },
  { value: "30d", label: "30D", hours: 24 * 30 },
] as const;
type RangeKey = (typeof RANGES)[number]["value"];

/// Series styling: PS Store solid teal, Steam dashed white, so the two lines
/// differ by stroke pattern as well as colour.
const STORE_STROKE: Record<StoreId, string> = {
  PLAYSTATION: "stroke-ov-teal",
  STEAM: "stroke-ov-white",
};
const STORE_DASH: Record<StoreId, string | undefined> = { PLAYSTATION: undefined, STEAM: "5 4" };
const STORE_FILL: Record<StoreId, string> = {
  PLAYSTATION: "fill-ov-teal",
  STEAM: "fill-ov-white",
};

function Swatch({ store }: { store: StoreId }) {
  return (
    <svg aria-hidden width="18" height="4" className="shrink-0">
      <line x1="0" x2="18" y1="2" y2="2" strokeWidth={2.5} strokeDasharray={STORE_DASH[store]} className={STORE_STROKE[store]} />
    </svg>
  );
}

interface Series {
  store: StoreId;
  label: string;
  url: string;
  currency: string;
  lastFetchedAt: string | null;
  current: {
    price: number;
    basePrice: number;
    isFree: boolean;
    formatted: string;
    saleEndsAt: string | null;
  } | null;
  previous: { t: string; price: number } | null;
  points: { t: string; price: number; basePrice: number }[];
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (n: number) => inr.format(n);

function timeAgo(iso: string | null) {
  if (!iso) return "never";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

function formatTick(date: Date, hours: number) {
  return hours <= 24
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatStamp(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/// Modal with the hourly price trail for every store we track the game on.
/// The body mounts only while open, so history is fetched on each opening.
export function PriceHistoryModal({
  open,
  onOpenChange,
  slug,
  gameName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  gameName: string;
}) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        full
        title={gameName}
        subtitle="Price history · INR"
        description={`Store price history for ${gameName}`}
      >
        <PriceHistoryBody slug={slug} />
      </Sheet>
    );
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="PRICE HISTORY · INDIA"
      title={gameName}
      description={`Store price history for ${gameName}`}
      className="max-w-[760px]"
    >
      <PriceHistoryBody slug={slug} />
    </Dialog>
  );
}

function PriceHistoryBody({ slug }: { slug: string }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [series, setSeries] = useState<Series[] | null>(null);
  const [focus, setFocus] = useState<StoreId | null>(null);
  const [hidden, setHidden] = useState<StoreId[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get<{ series: Series[] }>(`/api/games/${slug}/prices`, { params: { range } })
      .then((res) => {
        if (cancelled) return;
        setSeries(res.data.series);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, range]);

  const { hours } = RANGES.find((r) => r.value === range)!;
  // Stats follow the focused store; default to whichever is cheapest now.
  const cheapest = useMemo(
    () =>
      series
        ?.filter((s) => s.current)
        .sort((a, b) => a.current!.price - b.current!.price)[0]?.store ?? series?.[0]?.store,
    [series]
  );
  const active = series?.find((s) => s.store === (focus ?? cheapest)) ?? null;

  const stats = useMemo(() => {
    if (!active) return null;
    const prices = active.points.map((p) => p.price);
    if (active.previous) prices.unshift(active.previous.price);
    if (prices.length === 0) return null;
    return {
      low: Math.min(...prices),
      high: Math.max(...prices),
      change: prices[prices.length - 1] - prices[0],
    };
  }, [active]);

  const current = active?.current;
  const onSale = current && current.price < current.basePrice;
  const hasData = series?.some((s) => s.points.length > 0 || s.previous);

  return (
    <div className="flex flex-col gap-4 p-4 lg:gap-5 lg:px-6 lg:pt-0 lg:pb-6">
      {series && series.length > 0 && (
        <div role="radiogroup" aria-label="Store for the stats" className="flex flex-col gap-2">
          {series.map((sr) => {
            const selected = active?.store === sr.store;
            const isHidden = hidden.includes(sr.store);
            return (
              <div
                key={sr.store}
                className={cx(
                  "flex border transition-opacity",
                  selected ? "border-ov-teal-deep bg-ov-raised" : "border-ov-border",
                  isHidden && "opacity-55"
                )}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setFocus(sr.store)}
                  className="flex h-12 min-w-0 flex-1 items-center gap-2.5 px-3 text-left"
                >
                  <Swatch store={sr.store} />
                  <span className="flex-1 text-body font-medium">{sr.label}</span>
                  <span className="font-orbitron text-sm font-bold">{sr.current?.formatted ?? "—"}</span>
                </button>
                {series.length > 1 && (
                  <button
                    type="button"
                    aria-pressed={!isHidden}
                    aria-label={`${isHidden ? "Show" : "Hide"} ${sr.label} line`}
                    onClick={() =>
                      setHidden((h) => (isHidden ? h.filter((x) => x !== sr.store) : [...h, sr.store]))
                    }
                    className="flex w-16 items-center justify-center border-l border-ov-border text-ui text-ov-dim hover:text-ov-white"
                  >
                    {isHidden ? "Show" : "Hide"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 border border-ov-border bg-ov-panel md:grid-cols-4 [&>*]:border-ov-border [&>*]:px-4 [&>*]:py-3 [&>*:not(:last-child)]:md:border-r">
        <div className="flex flex-col gap-1">
          <Eyebrow>CURRENT</Eyebrow>
          <span className="flex flex-wrap items-baseline gap-2">
            <span className="font-orbitron text-xl font-bold">{current?.formatted ?? "—"}</span>
            {onSale && <s className="text-ui text-ov-muted">{money(current.basePrice)}</s>}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <Eyebrow>LOW</Eyebrow>
          <span className="font-orbitron text-xl font-bold text-ov-deal">
            {stats ? money(stats.low) : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <Eyebrow>HIGH</Eyebrow>
          <span className="font-orbitron text-xl font-bold">{stats ? money(stats.high) : "—"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <Eyebrow>CHANGE</Eyebrow>
          {stats ? (
            <span
              className={cx(
                "flex items-center gap-1 pt-0.5 text-body font-semibold",
                stats.change < 0 ? "text-ov-deal" : stats.change > 0 ? "text-ov-rose-soft" : "text-ov-dim"
              )}
            >
              {stats.change !== 0 && (
                <OvIcon name={stats.change < 0 ? "trend-down" : "trend-up"} className="text-sm" />
              )}
              {stats.change === 0
                ? "No change"
                : `${stats.change < 0 ? "Down" : "Up"} ${money(Math.abs(stats.change))}`}
            </span>
          ) : (
            <span className="text-ov-muted">—</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-ui text-ov-dim">
          {onSale && current?.saleEndsAt && (
            <Tag tone="rose" size="sm">
              Sale ends {formatStamp(new Date(current.saleEndsAt))}
            </Tag>
          )}
        </div>
        <ChipGroup
          label="Time range"
          variant="segmented"
          options={RANGES}
          value={range}
          onValueChange={setRange}
          className="ml-auto"
        />
      </div>

      <div
        aria-busy={loading}
        className={cx("transition-opacity duration-150", loading && series && "opacity-50")}
      >
        {failed ? (
          <ChartMessage>Couldn&apos;t load price history. Try again in a moment.</ChartMessage>
        ) : !series ? (
          <ChartMessage>Loading price data…</ChartMessage>
        ) : !hasData || !active ? (
          <ChartMessage>
            Tracking has just started. Prices are checked every hour, so the trail builds up from
            here.
          </ChartMessage>
        ) : (
          <PriceChart
            series={series.filter((sr) => !hidden.includes(sr.store) || sr.store === active.store)}
            focus={active.store}
            hours={hours}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-ov-border pt-4">
        <span className="flex items-center gap-1.5 font-mono text-label text-ov-muted">
          <OvIcon name="clock" className="text-sm" />
          Checked {timeAgo(active?.lastFetchedAt ?? null)} · hourly · INR
        </span>
        {active && (
          <Button asChild variant="primary" iconRight="external" className="ml-auto">
            <a href={active.url} target="_blank" rel="noreferrer">
              Open {active.label}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function ChartMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[240px] items-center justify-center px-6 text-center text-sm leading-relaxed text-ov-dim">
      {children}
    </div>
  );
}

const CHART_HEIGHT = 240;
const PAD = { top: 14, right: 14, bottom: 26, left: 64 };

type Sample = { t: number; price: number; base: number | null; since?: string };

/// A series' price at time t: the latest sample at or before it (prices hold
/// until the next change). Null before the series starts.
function priceAt(samples: Sample[], t: number) {
  let value: number | null = null;
  for (const s of samples) {
    if (s.t > t) break;
    value = s.price;
  }
  return value;
}

function toSamples(s: Series, start: number): Sample[] {
  // The sample from before the window anchors the line at its left edge.
  return [
    ...(s.previous ? [{ t: start, price: s.previous.price, base: null, since: s.previous.t }] : []),
    ...s.points.map((p) => ({ t: new Date(p.t).getTime(), price: p.price, base: p.basePrice })),
  ];
}

/// Step-line chart: a store price holds until the next sample shows a change,
/// so steps read truer than diagonals between hourly points. Every store is
/// drawn; the focused one is bright and carries the fill, low line and the
/// scrubber. The plot is a focusable slider: arrow keys step through samples.
function PriceChart({ series, focus, hours }: { series: Series[]; focus: StoreId; hours: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const now = Date.now();
  const start = now - hours * 60 * 60 * 1000;
  const lines = series
    .map((s) => ({ store: s.store, label: s.label, samples: toSamples(s, start) }))
    .filter((l) => l.samples.length > 0);
  const focused = lines.find((l) => l.store === focus) ?? lines[0];
  const hoverIndex = hover !== null && hover < focused.samples.length ? hover : null;

  const all = lines.flatMap((l) => l.samples.map((p) => p.price));
  let lo = Math.min(...all);
  let hi = Math.max(...all);
  // A flat line gets breathing room so it sits mid-plot instead of on an edge.
  const pad = hi === lo ? Math.max(hi * 0.1, 100) : (hi - lo) * 0.15;
  // Snap the axis to round rupee steps so tick labels read ₹3,000 not ₹2,814.
  const rawStep = (hi - lo + pad * 2) / 2;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep)!;
  lo = Math.max(0, Math.floor((lo - pad) / step) * step);
  hi = Math.ceil((hi + pad) / step) * step;

  const plotW = Math.max(width - PAD.left - PAD.right, 10);
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + ((t - start) / (now - start)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * plotH;

  const pathFor = (samples: Sample[]) => {
    let d = "";
    samples.forEach((p, i) => {
      d += i === 0 ? `M${x(p.t)},${y(p.price)}` : `H${x(p.t)}V${y(p.price)}`;
    });
    // Carry the latest known price through to "now".
    return `${d}H${x(now)}`;
  };
  const focusPath = pathFor(focused.samples);
  const area = `${focusPath}V${PAD.top + plotH}H${x(focused.samples[0].t)}Z`;
  const low = Math.min(...focused.samples.map((p) => p.price));

  const yTicks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) yTicks.push(v);
  const xTickCount = hours <= 24 ? 4 : hours <= 24 * 7 ? 7 : 5;
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => start + ((now - start) * i) / xTickCount);

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = event.clientX - rect.left;
    let best = 0;
    focused.samples.forEach((p, i) => {
      if (Math.abs(x(p.t) - px) < Math.abs(x(focused.samples[best].t) - px)) best = i;
    });
    setHover(best);
  };

  const onKey = (event: React.KeyboardEvent<SVGRectElement>) => {
    const last = focused.samples.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setHover((h) => Math.min(last, Math.max(0, (h ?? (delta > 0 ? -1 : last + 1)) + delta)));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setHover(event.key === "Home" ? 0 : last);
    }
  };

  const hovered = hoverIndex !== null ? focused.samples[hoverIndex] : null;
  const latest = focused.samples[focused.samples.length - 1];
  const tooltipLeft = hovered ? Math.min(Math.max(x(hovered.t), 70), width - 70) : 0;

  return (
    <div ref={wrapRef} className="relative">
      <svg width={width} height={CHART_HEIGHT} className="block select-none">
        <defs>
          <linearGradient id="ov-price-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-ov-teal)]" stopOpacity="0.14" />
            <stop offset="100%" className="[stop-color:var(--color-ov-teal)]" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g aria-hidden>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(v)} y2={y(v)} className="stroke-ov-raised" />
              <text
                x={PAD.left - 10}
                y={y(v)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-ov-muted font-mono text-micro"
              >
                {money(Math.round(v))}
              </text>
            </g>
          ))}
          {xTicks.map((t, i) => (
            <text
              key={t}
              x={x(t)}
              y={CHART_HEIGHT - 6}
              textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
              className="fill-ov-muted font-mono text-micro"
            >
              {i === xTicks.length - 1 ? "NOW" : formatTick(new Date(t), hours)}
            </text>
          ))}

          {focused.store === "PLAYSTATION" && <path d={area} fill="url(#ov-price-fill)" />}
          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={y(low)}
            y2={y(low)}
            className="stroke-ov-deal"
            strokeDasharray="4 5"
            opacity={0.6}
          />
          {lines.map((line) => (
            <path
              key={line.store}
              d={pathFor(line.samples)}
              fill="none"
              className={STORE_STROKE[line.store]}
              strokeWidth={line.store === focused.store ? 2.5 : 1.5}
              strokeDasharray={STORE_DASH[line.store]}
              strokeLinejoin="round"
              opacity={line.store === focused.store ? 1 : 0.6}
            />
          ))}

          {hovered && (
            <g pointerEvents="none">
              <line x1={x(hovered.t)} x2={x(hovered.t)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-ov-faint" />
              <rect
                x={x(hovered.t) - 5}
                y={y(hovered.price) - 5}
                width={10}
                height={10}
                transform={`rotate(45 ${x(hovered.t)} ${y(hovered.price)})`}
                className={cx(STORE_FILL[focused.store], "stroke-ov-field")}
                strokeWidth={2}
              />
            </g>
          )}
        </g>

        <rect
          x={PAD.left}
          y={PAD.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          tabIndex={0}
          role="slider"
          aria-label={`${focused.label} price over the last ${hours <= 24 ? "24 hours" : `${hours / 24} days`}. Use arrow keys to step through samples.`}
          aria-valuemin={0}
          aria-valuemax={focused.samples.length - 1}
          aria-valuenow={hoverIndex ?? focused.samples.length - 1}
          aria-valuetext={
            hovered
              ? `${money(hovered.price)}, ${formatStamp(new Date(hovered.t))}`
              : `Latest ${money(latest.price)}`
          }
          className="cursor-crosshair touch-none outline-none focus-visible:stroke-ov-teal-hover"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 flex -translate-x-1/2 -translate-y-full flex-col gap-0.5 border border-ov-border-strong bg-ov-bg px-2.5 py-2 whitespace-nowrap"
          style={{ left: tooltipLeft }}
        >
          <span className="text-label text-ov-dim">
            {hovered.since ? `Since ${formatStamp(new Date(hovered.since))}` : formatStamp(new Date(hovered.t))}
          </span>
          {lines.map((line) => {
            const at = priceAt(line.samples, hovered.t);
            return (
              <span key={line.store} className="flex items-center gap-2">
                <Swatch store={line.store} />
                <span className="w-14 text-label text-ov-dim">{line.store === "STEAM" ? "Steam" : "PS Store"}</span>
                <span className="font-orbitron text-ui font-bold">{at === null ? "—" : money(at)}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
