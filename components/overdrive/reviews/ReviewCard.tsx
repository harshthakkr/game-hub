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

  // Reviews read as a feed, not a stack of panels: no border or fill of their own,
  // separated by the list's hairline dividers.
  return (
    <article className="py-5">
      <header className="flex flex-wrap items-start gap-3">
        <Avatar author={review.author} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-body font-semibold text-ov-white">
              {displayName(review.author)}
            </span>
            {review.isMine && (
              <span className="text-micro tracking-hud-wide text-ov-teal">
                YOUR REVIEW
              </span>
            )}
          </div>
          <div className="mt-0.5 text-label tracking-wide text-ov-muted">
            {relativeTime(review.createdAt)}
            {review.updatedAt !== review.createdAt && " · edited"}
            {" · "}
            {review.wordCount} words
          </div>
        </div>
        <VerdictBadge verdict={review.verdict} />
      </header>

      <div className="relative mt-3.5">
        <p
          className={`whitespace-pre-wrap text-sm leading-[1.85] text-ov-text ${
            clamped ? (veiled ? "line-clamp-3" : "line-clamp-[7]") : ""
          } ${veiled ? "select-none blur-[5px]" : ""}`}
        >
          {review.body}
        </p>

        {veiled && (
          <div className="absolute inset-0 flex items-center justify-center bg-ov-bg/50">
            <div className="flex items-center gap-2 text-micro tracking-hud-wide text-ov-rose">
              <OvIcon name="spoiler" className="text-micro" />
              SPOILERS
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="border-b border-ov-rose/60 pb-px text-micro tracking-hud text-ov-rose transition-colors duration-150 hover:border-ov-rose hover:text-ov-white"
              >
                REVEAL
              </button>
            </div>
          </div>
        )}
      </div>

      {!veiled && collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center text-label tracking-hud text-ov-teal transition-opacity duration-150 hover:opacity-75"
        >
          {expanded ? "SHOW LESS" : "READ FULL REVIEW"}
          <OvIcon name={expanded ? "chevron-up" : "chevron-down"} className="ml-1 text-label" />
        </button>
      )}

      <footer className="mt-3.5 flex flex-wrap items-center gap-5">
        <LikeButton
          liked={review.likedByMe}
          count={review.likeCount}
          disabled={!viewer}
          onToggle={like}
        />
        <button
          type="button"
          onClick={() => setThreadOpen((v) => !v)}
          aria-expanded={threadOpen}
          className={`flex items-center gap-1.5 text-xs tracking-hud transition-all duration-150 hover:opacity-75 active:scale-95 ${
            threadOpen ? "text-ov-teal" : "text-ov-muted"
          }`}
        >
          <OvIcon name="comment" className="text-label" />
          <span className="font-orbitron font-bold">{review.commentCount}</span>
          <span className="text-label">
            {review.commentCount === 1 ? "COMMENT" : "COMMENTS"}
          </span>
        </button>
        {review.hasSpoilers && (
          <span className="ml-auto flex items-center gap-1.5 text-micro tracking-hud text-ov-rose">
            <OvIcon name="spoiler" className="text-micro" />
            SPOILERS
          </span>
        )}
      </footer>

      {threadOpen && (
        <CommentThread
          reviewId={review.id}
          viewer={viewer}
          onCountChange={syncCommentCount}
        />
      )}
    </article>
  );
}
