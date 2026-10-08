"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import { OvIcon } from "../OvIcon";
import { Avatar } from "./Avatar";
import { CommentThread } from "./CommentThread";
import { LikeButton } from "./LikeButton";
import { VerdictBadge } from "./VerdictBadge";
import { displayName, relativeTime } from "@/utils/reviews";
import type { ReviewProps } from "@/utils/types";

type Viewer = {
  username: string | null;
  name: string | null;
  image: string | null;
} | null;

/// Long reviews collapse to a preview; roughly a screenful of prose.
const PREVIEW_WORD_LIMIT = 110;

export function ReviewCard({
  review,
  viewer,
  onChange,
}: {
  review: ReviewProps;
  viewer: Viewer;
  onChange: (review: ReviewProps) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);

  // The thread reports its own count back up; reading the latest review through
  // a ref keeps that callback stable so the report fires once per real change.
  const reviewRef = useRef(review);
  reviewRef.current = review;

  const syncCommentCount = useCallback(
    (count: number) => {
      if (reviewRef.current.commentCount !== count) {
        onChange({ ...reviewRef.current, commentCount: count });
      }
    },
    [onChange]
  );

  const veiled = review.hasSpoilers && !revealed;
  const collapsible = review.wordCount > PREVIEW_WORD_LIMIT;
  const clamped = veiled || (collapsible && !expanded);

  const like = useCallback(async () => {
    if (!viewer) return;
    const optimistic = {
      ...review,
      likedByMe: !review.likedByMe,
      likeCount: review.likeCount + (review.likedByMe ? -1 : 1),
    };
    onChange(optimistic);
    try {
      const res = await axios.post<{ liked: boolean; likeCount: number }>(
        `/api/reviews/${review.id}/like`
      );
      onChange({
        ...optimistic,
        likedByMe: res.data.liked,
        likeCount: res.data.likeCount,
      });
    } catch {
      onChange(review);
    }
  }, [review, viewer, onChange]);

  // Reviews read as a feed, not a stack of panels: hairlines between items.
  return (
    <article className="flex flex-col gap-3 border-b border-ov-raised pb-5">
      <header className="flex flex-wrap items-center gap-2.5">
        <span className="ov-chamfer ov-chamfer-sm">
          <Avatar author={review.author} size={32} />
        </span>
        <span className="text-sm font-semibold text-ov-white">{displayName(review.author)}</span>
        {review.isMine && <span className="font-hud text-micro tracking-label text-ov-teal">YOU</span>}
        <span className="text-ui text-ov-muted">
          {relativeTime(review.createdAt)}
          {review.updatedAt !== review.createdAt && " · edited"}
        </span>
        <span className="ml-auto">
          <VerdictBadge verdict={review.verdict} />
        </span>
      </header>

      {veiled ? (
        <div className="relative max-w-[720px]">
          <p aria-hidden className="line-clamp-3 select-none font-body text-body leading-relaxed text-ov-text blur-[7px]">
            {review.body}
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 border border-ov-amber bg-ov-field px-3 py-1.5 text-ui font-semibold text-ov-amber transition-colors hover:bg-ov-raised"
            >
              <OvIcon name="spoiler" className="text-sm" />
              Spoiler · reveal review
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`max-w-[720px] whitespace-pre-wrap font-body text-body leading-relaxed text-pretty text-ov-text ${
            clamped ? "line-clamp-[7]" : ""
          }`}
        >
          {review.body}
        </p>
      )}

      {!veiled && collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-max items-center gap-1 text-ui font-medium text-ov-teal hover:text-ov-teal-hover"
        >
          {expanded ? "Show less" : "Read full review"}
          <OvIcon name={expanded ? "chevron-up" : "chevron-down"} className="text-sm" />
        </button>
      )}

      <footer className="flex flex-wrap items-center gap-4">
        <LikeButton liked={review.likedByMe} count={review.likeCount} disabled={!viewer} onToggle={like} />
        <button
          type="button"
          onClick={() => setThreadOpen((v) => !v)}
          aria-expanded={threadOpen}
          aria-label={`${review.commentCount} ${review.commentCount === 1 ? "comment" : "comments"}`}
          className={`flex items-center gap-1.5 text-ui transition-colors duration-150 hover:text-ov-white ${
            threadOpen ? "text-ov-white" : "text-ov-dim"
          }`}
        >
          <OvIcon name="comment" className="text-sm" />
          {review.commentCount}
        </button>
        {review.hasSpoilers && (
          <span className="ml-auto flex items-center gap-1.5 text-label text-ov-amber">
            <OvIcon name="spoiler" className="text-sm" />
            Contains spoilers
          </span>
        )}
      </footer>

      {threadOpen && (
        <CommentThread reviewId={review.id} viewer={viewer} onCountChange={syncCommentCount} />
      )}
    </article>
  );
}
