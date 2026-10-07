"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { OvIcon } from "../OvIcon";
import { Button, Checkbox, ChipGroup } from "@/components/ui";
import { ReviewListSkeleton } from "../Skeletons";
import { ReviewCard } from "./ReviewCard";
import { ReviewComposer } from "./ReviewComposer";
import { VerdictMeter } from "./VerdictMeter";
import {
  REVIEW_SORTS,
  type ReviewSort,
  type Verdict,
} from "@/utils/reviews";
import type { ReviewProps, ReviewsResponse } from "@/utils/types";

const EMPTY_STATS: ReviewsResponse["stats"] = {
  total: 0,
  counts: {
    SKIP: 0,
    TIMEPASS: 0,
    WORTH_IT: 0,
    GO_FOR_IT: 0,
    MASTERPIECE: 0,
  },
  consensus: null,
  spoilerCount: 0,
};

function Pager({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  // Window of at most 5 page numbers centred on the current page.
  const window = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    const end = Math.min(pages, start + 4);
    const list: number[] = [];
    for (let i = Math.max(1, start); i <= end; i++) list.push(i);
    return list;
  }, [page, pages]);

  if (pages <= 1) return null;

  return (
    <nav aria-label="Review pages" className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Button size="sm" icon="chevron-left" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        PREV
      </Button>
      {window[0] > 1 && <span className="text-label text-ov-muted">…</span>}
      {window.map((n) => (
        <Button
          key={n}
          size="sm"
          chamfer
          variant={n === page ? "primary" : "outline"}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Page ${n}`}
          onClick={() => onChange(n)}
        >
          {n}
        </Button>
      ))}
      {window[window.length - 1] < pages && (
        <span className="text-label text-ov-muted">…</span>
      )}
      <Button size="sm" iconRight="chevron-right" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        NEXT
      </Button>
    </nav>
  );
}

export function ReviewsPanel({
  gameId,
  gameSlug,
  gameName,
}: {
  gameId?: number;
  gameSlug: string;
  gameName: string;
}) {
  const { data: session, status } = useSession();
  const viewer = session?.user
    ? {
        username: session.user.username ?? null,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null;

  const [sort, setSort] = useState<ReviewSort>("liked");
  const [hideSpoilers, setHideSpoilers] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [page, setPage] = useState(1);

  const [reviews, setReviews] = useState<ReviewProps[]>([]);
  const [myReview, setMyReview] = useState<ReviewProps | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    // Any filter change restarts pagination.
    setPage(1);
  }, [sort, hideSpoilers, verdict]);

  useEffect(() => {
    if (!gameId || status === "loading") return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      gameId: String(gameId),
      sort,
      page: String(page),
    });
    if (hideSpoilers) params.set("spoilers", "hide");
    if (verdict) params.set("verdict", verdict);

    axios
      .get<ReviewsResponse>(`/api/reviews?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setReviews(res.data.reviews);
        setMyReview(res.data.myReview);
        setStats(res.data.stats);
        setPages(res.data.pages);
        setTotal(res.data.total);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load reviews.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, sort, hideSpoilers, verdict, page, status, reloadKey]);

  const updateReview = useCallback((next: ReviewProps) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === next.id ? next : review))
    );
    setMyReview((prev) => (prev && prev.id === next.id ? next : prev));
  }, []);

  if (!gameId) {
    return (
      <div className="px-8 py-12 text-center text-ui text-ov-muted">
        Reviews are unavailable for this title.
      </div>
    );
  }

  // One column, sections parted by hairlines rather than each being its own panel.
  return (
    <div>
      <VerdictMeter
        stats={stats}
        activeVerdict={verdict}
        onVerdictChange={setVerdict}
      />

      {/* Re-keyed so the composer resets between "no review" and "editing mine". */}
      <div className="mt-6 border-t border-ov-border pt-6">
        <ReviewComposer
          key={myReview?.id ?? "new"}
          gameId={gameId}
          gameSlug={gameSlug}
          gameName={gameName}
          viewer={viewer}
          myReview={myReview}
          onSaved={reload}
          onDeleted={reload}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-ov-border pt-4">
        <span aria-hidden className="text-micro tracking-hud-wide text-ov-dim">SORT</span>
        <ChipGroup label="Sort reviews" options={REVIEW_SORTS} value={sort} onValueChange={setSort} />

        <Checkbox size="sm" checked={hideSpoilers} onCheckedChange={setHideSpoilers} className="ml-auto">
          HIDE SPOILERS
          {stats.spoilerCount > 0 && ` (${stats.spoilerCount})`}
        </Checkbox>
      </div>

      {loading ? (
        <ReviewListSkeleton />
      ) : error ? (
        <div
          role="alert"
          className="animate-ov-fade-up mt-4 border-l-2 border-ov-rose py-2 pl-3.5 text-ui text-ov-rose"
        >
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="px-8 py-[54px] text-center">
          <div className="mx-auto mb-3 flex justify-center text-ov-muted">
            <OvIcon name="comment" className="text-title" />
          </div>
          <div className="font-orbitron text-sm font-bold tracking-hud-wide text-ov-text">
            {stats.total === 0 ? "NO REVIEWS YET" : "NOTHING MATCHES THOSE FILTERS"}
          </div>
          <p className="mt-2.5 text-ui text-ov-muted">
            {stats.total === 0
              ? `Be the first to call it on ${gameName}.`
              : "Loosen the filters to see more player verdicts."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 text-label tracking-hud text-ov-muted">
            SHOWING {reviews.length} OF {total}
            {verdict || hideSpoilers ? " FILTERED" : ""}{" "}
            {total === 1 ? "REVIEW" : "REVIEWS"}
          </div>
          <div className="mt-1 divide-y divide-ov-border border-t border-ov-border">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                viewer={viewer}
                onChange={updateReview}
              />
            ))}
          </div>
          <Pager page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
