"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { StoreListing } from "@/utils/types";
import { discountLabel } from "@/utils/price";
import { Button, Eyebrow, Tag } from "@/components/ui";
import { cx } from "@/utils/cx";
import { OvIcon } from "./OvIcon";
import { PriceHistoryModal } from "./PriceHistoryModal";

type Series = {
  store: StoreListing["store"];
  lastFetchedAt: string | null;
  /// The price just before the window (prices are stored only on change, so
  /// a week with no change has no points of its own).
  previous: { t: string; price: number } | null;
  points: { t: string; price: number }[];
};

/// 7-day price trail per store, for the trend notes and sparkline. Optional
/// decoration: a failure just leaves them out.
function useWeekTrend(slug: string, enabled: boolean) {
  const [series, setSeries] = useState<Series[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    axios
      .get<{ series: Series[] }>(`/api/games/${slug}/prices`, { params: { range: "7d" } })
      .then((res) => !cancelled && setSeries(res.data.series))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, enabled]);
  return series;
}

function Sparkline({ points, label }: { points: { price: number }[]; label: string }) {
  if (points.length < 2) return null;
  const prices = points.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const coords = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${max === min ? 50 : 90 - ((p.price - min) / span) * 80}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-11 w-full" role="img" aria-label={label}>
      <polyline points={coords} fill="none" className="stroke-ov-teal" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function trendNote(points: { price: number }[]) {
  if (points.length < 2) return null;
  const first = points[0].price;
  const last = points[points.length - 1].price;
  if (last < first) return { text: `Down ₹${(first - last).toLocaleString("en-IN")} this week`, tone: "text-ov-deal" };
  if (last > first) return { text: `Up ₹${(last - first).toLocaleString("en-IN")} this week`, tone: "text-ov-rose-soft" };
  return { text: "No change this week", tone: "text-ov-dim" };
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return null;
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

/// "Where to buy": every store the game is listed on, each with its own sale
/// state. When both stores have a price, the cheaper one gets a teal frame
/// and a CHEAPEST tag. Price history opens one chart covering both.
export function WhereToBuy({
  slug,
  gameName,
  stores,
}: {
  slug: string;
  gameName: string;
  stores: StoreListing[];
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const priced = stores.filter((s) => s.price);
  const cheapest = priced.length > 1 ? [...priced].sort((a, b) => a.price!.amount - b.price!.amount)[0] : null;
  const trend = useWeekTrend(slug, priced.length > 0);
  const checked = timeAgo(
    trend.map((s) => s.lastFetchedAt).filter(Boolean).sort().at(-1)
  );

  return (
    <section
      aria-labelledby="where-to-buy"
      className="ov-chamfer flex flex-col gap-2.5 lg:gap-3.5 lg:border lg:border-ov-border lg:bg-ov-panel lg:p-5.5"
    >
      <h2 id="where-to-buy">
        <Eyebrow tick>WHERE TO BUY</Eyebrow>
      </h2>

      {stores.length === 0 && (
        <p className="border border-dashed border-ov-border-strong p-4 text-sm leading-normal text-ov-dim">
          Not sold on Steam or PlayStation Store India. We&apos;ll show a price if it becomes available.
        </p>
      )}

      {stores.map((store) => {
        const isCheapest = store === cheapest;
        const off = discountLabel(store.price);
        const week = trend.find((s) => s.store === store.store);
        const points = [...(week?.previous ? [week.previous] : []), ...(week?.points ?? [])];
        const note = trendNote(points);
        return (
          <div
            key={store.store}
            className={cx(
              "flex flex-col gap-2 border bg-ov-field px-3.5 py-3 lg:gap-3 lg:p-4",
              isCheapest ? "border-ov-teal-deep" : "border-ov-border"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-body font-semibold">{store.label}</span>
              {isCheapest && (
                <span className="bg-ov-teal px-1.5 py-0.5 font-hud text-micro font-medium tracking-label text-ov-teal-ink">
                  CHEAPEST
                </span>
              )}
              {off && (
                <Tag tone="deal" size="sm" className="ml-auto">
                  {off}
                </Tag>
              )}
            </div>
            {store.price ? (
              <div className="flex items-center gap-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-orbitron text-[21px] font-bold lg:text-[26px]">
                      {off && <span className="sr-only">Now </span>}
                      {store.price.current}
                    </span>
                    {store.price.original && (
                      <s className="text-ui text-ov-muted">
                        <span className="sr-only">was </span>
                        {store.price.original}
                      </s>
                    )}
                  </span>
                  <span className={cx("text-ui", note?.tone ?? "text-ov-dim")}>
                    {note?.text ?? (off ? "On sale now" : "Regular price")}
                  </span>
                </div>
                <Button asChild variant="secondary" size="md" iconRight="external" chamfer={false}>
                  <a href={store.url} target="_blank" rel="noreferrer" aria-label={`Open ${store.label}`}>
                    Open
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-body font-semibold text-ov-text">Price unavailable</span>
                  <span className="text-ui text-ov-muted">We&apos;ll have it after the next check, within 3 hours.</span>
                </span>
                <Button asChild variant="outline" size="md" iconRight="external" chamfer={false}>
                  <a href={store.url} target="_blank" rel="noreferrer" aria-label={`Open ${store.label}`}>
                    Open
                  </a>
                </Button>
              </div>
            )}
            {isCheapest && (
              <div className="hidden lg:block">
                <Sparkline points={points} label={`${store.label} price over the last 7 days`} />
              </div>
            )}
          </div>
        );
      })}

      {priced.length > 0 && (
        <>
          <Button variant="secondary" size="lg" chamfer={false} className="w-full" onClick={() => setHistoryOpen(true)}>
            <OvIcon name="trend-down" className="text-base" />
            {priced.length > 1 ? "Price history · both stores" : "Price history"}
          </Button>
          {checked && <p className="text-label text-ov-muted">Checked {checked} · refreshes every 3 hours</p>}
          <PriceHistoryModal open={historyOpen} onOpenChange={setHistoryOpen} slug={slug} gameName={gameName} />
        </>
      )}
    </section>
  );
}
