"use client";

import axios from "axios";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { OvIcon } from "./OvIcon";
import { Button, ChipGroup, Dialog, Price, Stat, Tag } from "@/components/ui";

const RANGES = [
  { key: "24h", label: "24H", hours: 24 },
  { key: "7d", label: "7D", hours: 24 * 7 },
  { key: "30d", label: "30D", hours: 24 * 30 },
] as const;
type RangeKey = (typeof RANGES)[number]["key"];

interface PricePoint {
  t: string;
  price: number;
  basePrice: number;
}

interface PriceHistory {
  productName: string | null;
  url: string;
  currency: string;
  lastFetchedAt: string | null;
  lastError: string | null;
  current: {
    price: number;
    basePrice: number;
    isFree: boolean;
    formatted: string;
    saleEndsAt: string | null;
  } | null;
  previous: { t: string; price: number } | null;
  points: PricePoint[];
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

/// Modal showing the PS Store price trail for a game, sampled hourly. The
/// body mounts only while open, so history is fetched on each opening.
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
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="PRICE TRACKER · PS STORE IN"
      title={gameName}
      description={`PlayStation Store price history for ${gameName}`}
      className="max-w-[720px]"
    >
      <PriceHistoryBody slug={slug} />
    </Dialog>
  );
}

const RANGE_OPTIONS = RANGES.map((r) => ({ value: r.key, label: r.label }));

function PriceHistoryBody({ slug }: { slug: string }) {
  const [range, setRange] = useState<RangeKey>("24h");
  const [history, setHistory] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get<PriceHistory>(`/api/games/${slug}/prices`, { params: { range } })
      .then((res) => {
        if (cancelled) return;
        setHistory(res.data);
        setFailed(false);
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, range]);

  const { hours, label: rangeLabel } = RANGES.find((r) => r.key === range)!;
  const stats = useMemo(() => {
    if (!history) return null;
    const prices = history.points.map((p) => p.price);
    if (history.previous) prices.unshift(history.previous.price);
    if (prices.length === 0) return null;
    const start = prices[0];
    const end = prices[prices.length - 1];
    return { low: Math.min(...prices), high: Math.max(...prices), change: end - start };
  }, [history]);

  const current = history?.current;
  const onSale = current && current.price < current.basePrice;

  return (
    <>
      <div className="grid grid-cols-2 gap-px border-b border-ov-border bg-ov-border md:grid-cols-4">
        <Stat label="CURRENT" className="bg-ov-panel px-5 py-3">
          {current ? (
            <Price
              size="xl"
              current={current.formatted}
              original={onSale ? money(current.basePrice) : null}
            />
          ) : (
            <span className="text-ov-muted">—</span>
          )}
        </Stat>
        <Stat label={`LOW · ${rangeLabel}`} className="bg-ov-panel px-5 py-3">
          {stats ? money(stats.low) : "—"}
        </Stat>
        <Stat label={`HIGH · ${rangeLabel}`} className="bg-ov-panel px-5 py-3">
          {stats ? money(stats.high) : "—"}
        </Stat>
        <Stat label="CHANGE" className="bg-ov-panel px-5 py-3">
          {stats ? (
            <span
              className={`inline-flex items-center gap-1 ${
                stats.change < 0 ? "text-ov-teal" : stats.change > 0 ? "text-ov-rose" : ""
              }`}
            >
              {stats.change !== 0 && (
                <OvIcon name={stats.change < 0 ? "trend-down" : "trend-up"} className="text-sm" />
              )}
              {stats.change === 0
                ? "No change"
                : `${stats.change < 0 ? "Down" : "Up"} ${money(Math.abs(stats.change))}`}
            </span>
          ) : (
            "—"
          )}
        </Stat>
      </div>

      <div className="px-5 pt-3">
        <div className="flex flex-wrap items-center">
          <ChipGroup
            label="Time range"
            variant="underline"
            options={RANGE_OPTIONS}
            value={range}
            onValueChange={setRange}
            className="flex-1"
          />
          {onSale && current?.saleEndsAt && (
            <Tag tone="rose" size="sm" className="ml-3">
              SALE ENDS {formatStamp(new Date(current.saleEndsAt)).toUpperCase()}
            </Tag>
          )}
        </div>

        <div
          aria-busy={loading}
          className={`py-4 transition-opacity duration-150 ${loading && history ? "opacity-50" : ""}`}
        >
          {failed ? (
            <ChartMessage>Couldn&apos;t load price history. Try again in a moment.</ChartMessage>
          ) : !history ? (
            <ChartMessage>
              <span className="animate-ov-pulse">LOADING PRICE DATA…</span>
            </ChartMessage>
          ) : history.points.length === 0 && !history.previous ? (
            <ChartMessage>
              Tracking has just started — prices are sampled every hour, so the
              trail builds up from here.
            </ChartMessage>
          ) : (
            <PriceChart history={history} hours={hours} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-ov-border px-5 py-3.5">
        <span className="inline-flex items-center text-label tracking-wide text-ov-dim">
          <OvIcon name="clock" className="mr-1.5 text-label" />
          Checked {timeAgo(history?.lastFetchedAt ?? null)} · refreshes hourly
        </span>
        {history && (
          <Button asChild variant="primary" iconRight="chevron-right" className="ml-auto">
            <a href={history.url} target="_blank" rel="noreferrer">
              OPEN IN PS STORE
            </a>
          </Button>
        )}
      </div>
    </>
  );
}

function ChartMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[220px] items-center justify-center px-6 text-center text-ui leading-relaxed text-ov-muted">
      {children}
    </div>
  );
}

const CHART_HEIGHT = 220;
const PAD = { top: 14, right: 14, bottom: 26, left: 64 };

/// Step-line chart: a store price holds until the next sample shows a change,
/// so steps read truer than diagonals between hourly points.
function PriceChart({ history, hours }: { history: PriceHistory; hours: number }) {
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
  // The sample from before the window anchors the line at its left edge.
  const series = [
    ...(history.previous ? [{ t: start, price: history.previous.price, base: null }] : []),
    ...history.points.map((p) => ({
      t: new Date(p.t).getTime(),
      price: p.price,
      base: p.basePrice,
    })),
  ];

  const prices = series.map((p) => p.price);
  let lo = Math.min(...prices);
  let hi = Math.max(...prices);
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

  let path = "";
  series.forEach((p, i) => {
    path += i === 0 ? `M${x(p.t)},${y(p.price)}` : `H${x(p.t)}V${y(p.price)}`;
  });
  // Carry the latest known price through to "now".
  path += `H${x(now)}`;
  const area = `${path}V${PAD.top + plotH}H${x(series[0].t)}Z`;

  const yTicks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) yTicks.push(v);
  const xTickCount = hours <= 24 ? 4 : hours <= 24 * 7 ? 7 : 5;
  const xTicks = Array.from(
    { length: xTickCount + 1 },
    (_, i) => start + ((now - start) * i) / xTickCount
  );

  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = event.clientX - rect.left;
    let best = 0;
    series.forEach((p, i) => {
      if (Math.abs(x(p.t) - px) < Math.abs(x(series[best].t) - px)) best = i;
    });
    setHover(best);
  };

  const hovered = hover !== null ? series[hover] : null;
  const tooltipLeft = hovered ? Math.min(Math.max(x(hovered.t), 70), width - 70) : 0;

  return (
    <div ref={wrapRef} className="relative">
      <svg
        width={width}
        height={CHART_HEIGHT}
        role="img"
        aria-label={`Price over the last ${hours} hours`}
        className="block select-none"
      >
        <defs>
          <linearGradient id="ov-price-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" className="[stop-color:var(--color-ov-teal)]" stopOpacity="0.18" />
            <stop offset="100%" className="[stop-color:var(--color-ov-teal)]" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={PAD.left + plotW}
              y1={y(v)}
              y2={y(v)}
              className="stroke-ov-border"
              strokeDasharray="2 4"
            />
            <text
              x={PAD.left - 10}
              y={y(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-ov-muted text-micro"
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
            className="fill-ov-muted text-micro"
          >
            {i === xTicks.length - 1 ? "NOW" : formatTick(new Date(t), hours)}
          </text>
        ))}

        <path d={area} fill="url(#ov-price-fill)" />
        <path
          d={path}
          fill="none"
          className="stroke-ov-teal"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={x(now)}
          cy={y(series[series.length - 1].price)}
          r={4}
          className="fill-ov-teal stroke-ov-panel"
          strokeWidth={2}
        />

        {hovered && (
          <g pointerEvents="none">
            <line
              x1={x(hovered.t)}
              x2={x(hovered.t)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              className="stroke-ov-dim"
              strokeWidth={1}
            />
            <circle
              cx={x(hovered.t)}
              cy={y(hovered.price)}
              r={5}
                  className="fill-ov-teal stroke-ov-panel"
              strokeWidth={2}
            />
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={plotW}
          height={plotH}
          fill="transparent"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 border border-ov-border bg-ov-bg px-3 py-2 whitespace-nowrap"
          style={{ left: tooltipLeft }}
        >
          <div className="font-orbitron text-sm font-bold text-white">{money(hovered.price)}</div>
          {hovered.base !== null && hovered.base > hovered.price && (
            <div className="text-micro text-ov-muted line-through">{money(hovered.base)}</div>
          )}
          <div className="mt-0.5 text-micro tracking-wide text-ov-dim">
            {hover === 0 && history.previous
              ? `Since ${formatStamp(new Date(history.previous.t))}`
              : formatStamp(new Date(hovered.t))}
          </div>
        </div>
      )}

      {/* Screen-reader view of the same samples. */}
      <table className="sr-only">
        <caption>Sampled PS Store prices</caption>
        <thead>
          <tr>
            <th>Time</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {history.points.map((p) => (
            <tr key={p.t}>
              <td>{formatStamp(new Date(p.t))}</td>
              <td>{money(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
