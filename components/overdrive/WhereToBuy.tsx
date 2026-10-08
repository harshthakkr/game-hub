"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { StoreListing } from "@/utils/types";
import { discountLabel } from "@/utils/price";
import { Button, Eyebrow, Price, Tag } from "@/components/ui";
import { cx } from "@/utils/cx";
import { PriceHistoryModal } from "./PriceHistoryModal";

type Series = { store: StoreListing["store"]; points: { t: string; price: number }[] };

/// 7-day price trail per store, for the sparklines. Optional decoration: a
/// failure just leaves the sparklines out.
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
      <polyline
        points={coords}
        fill="none"
        className="stroke-ov-teal"
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function trendNote(points: { price: number }[]) {
  if (points.length < 2) return null;
  const first = points[0].price;
  const last = points[points.length - 1].price;
  if (last < first) return { text: `Down ₹${(first - last).toLocaleString("en-IN")} this week`, tone: "deal" as const };
  if (last > first) return { text: `Up ₹${(last - first).toLocaleString("en-IN")} this week`, tone: "rose" as const };
  return { text: "No change this week", tone: "muted" as const };
}

/// "Where to buy": every store the game is listed on. The cheapest priced
/// store is expanded with its sale state, week trend and actions; the rest
/// are compact rows. Price history opens one chart covering every store.
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
  const best = [...priced].sort((a, b) => a.price!.amount - b.price!.amount)[0];
  const trend = useWeekTrend(slug, priced.length > 0);

  return (
    <section aria-labelledby="where-to-buy" className="ov-chamfer flex flex-col gap-3.5 border border-ov-border bg-ov-panel p-5.5">
      <h2 id="where-to-buy">
        <Eyebrow>WHERE TO BUY</Eyebrow>
      </h2>

      {stores.length === 0 && (
        <p className="border border-dashed border-ov-border-strong p-4 text-sm leading-normal text-ov-dim">
          Not sold on Steam or PlayStation Store India. We&apos;ll show a price if it becomes available.
        </p>
      )}

      {stores.map((store) => {
        const isBest = store === best && priced.length > 1;
        const off = discountLabel(store.price);
        const points = trend.find((s) => s.store === store.store)?.points ?? [];
        const note = trendNote(points);

        if (store !== best) {
          return (
            <a
              key={store.store}
              href={store.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 border border-ov-border bg-ov-field px-4 py-3.5 transition-colors duration-150 hover:border-ov-border-strong"
            >
              <span className="text-body font-semibold">{store.label}</span>
              <span className="flex items-center gap-2.5">
                {store.price ? (
                  <Price size="md" current={store.price.current} original={store.price.original} />
                ) : (
                  <span className="text-ui text-ov-muted">Price pending</span>
                )}
                <span className="sr-only">(opens {store.label})</span>
              </span>
            </a>
          );
        }

        return (
          <div
            key={store.store}
            className={cx(
              "flex flex-col gap-3 border bg-ov-field p-4",
              isBest ? "border-ov-teal-deep" : "border-ov-border"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body font-semibold">{store.label}</span>
              <span className="flex gap-1.5">
                {isBest && <Tag tone="teal" size="sm">Best price</Tag>}
                {off && <Tag tone="deal" size="sm">{off}</Tag>}
              </span>
            </div>
            <Price size="xl" current={store.price!.current} original={store.price!.original} />
            <Sparkline points={points} label={`${store.label} price over the last 7 days`} />
            <div className="flex justify-between text-ui">
              <span
                className={cx(
                  note?.tone === "deal" && "text-ov-deal",
                  note?.tone === "rose" && "text-ov-rose-soft",
                  (!note || note.tone === "muted") && "text-ov-dim"
                )}
              >
                {note?.text ?? (off ? "On sale now" : "Regular price")}
              </span>
              <span className="text-ov-muted">7-day trend</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" chamfer={false} className="flex-1" onClick={() => setHistoryOpen(true)}>
                Price history
              </Button>
              <Button asChild variant="primary" size="md" iconRight="external" className="flex-1">
                <a href={store.url} target="_blank" rel="noreferrer">
                  Open store
                </a>
              </Button>
            </div>
          </div>
        );
      })}

      {priced.length > 0 && (
        <PriceHistoryModal open={historyOpen} onOpenChange={setHistoryOpen} slug={slug} gameName={gameName} />
      )}
    </section>
  );
}
