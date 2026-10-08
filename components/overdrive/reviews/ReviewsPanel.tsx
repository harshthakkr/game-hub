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
  VERDICTS,
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
        Prev
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
        Next
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
    return <p className="py-12 text-center text-sm text-ov-dim">Reviews are unavailable for this title.</p>;
  }

  const verdictLabel = verdict ? VERDICTS.find((v) => v.value === verdict)?.label : null;

  return (
    <div className="flex flex-wrap items-start gap-8">
      <div className="max-w-[380px] min-w-0 flex-[1_1_280px]">
        <VerdictMeter stats={stats} activeVerdict={verdict} onVerdictChange={setVerdict} />
      </div>

      <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-5">
        {/* Re-keyed so the composer resets between "no review" and "editing mine". */}
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

        <div className="flex flex-wrap items-center gap-3 border-b border-ov-border pb-3">
          {verdictLabel && (
            <span className="flex items-center gap-1.5 border border-ov-teal-deep bg-ov-teal/8 py-1 pr-1.5 pl-2.5 text-ui text-ov-teal-hover">
              Showing {verdictLabel} reviews
              <button
                type="button"
                onClick={() => setVerdict(null)}
                aria-label="Show all verdicts"
                className="flex size-[18px] items-center justify-center hover:text-ov-white"
              >
                <OvIcon name="close" className="text-xs" />
              </button>
            </span>
          )}
          <Checkbox checked={hideSpoilers} onCheckedChange={setHideSpoilers}>
            Hide spoilers{stats.spoilerCount > 0 && ` (${stats.spoilerCount})`}
          </Checkbox>
          <ChipGroup
            label="Sort reviews"
            variant="segmented"
            options={REVIEW_SORTS}
            value={sort}
            onValueChange={setSort}
            className="ml-auto"
          />
        </div>

        {loading ? (
          <ReviewListSkeleton />
        ) : error ? (
          <p role="alert" className="border-l-2 border-ov-rose py-2 pl-3.5 text-sm text-ov-rose-soft">
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <p className="border border-dashed border-ov-border-strong p-10 text-center text-sm text-ov-dim">
            {stats.total === 0
              ? `No reviews yet. Be the first to call it on ${gameName}.`
              : "No reviews match these filters."}
          </p>
        ) : (
          <>
            <p className="font-mono text-label text-ov-muted" aria-live="polite">
              {reviews.length} of {total} {total === 1 ? "review" : "reviews"}
            </p>
            <div className="flex flex-col gap-5">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} viewer={viewer} onChange={updateReview} />
              ))}
            </div>
            <Pager page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
