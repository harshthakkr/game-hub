"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { OvIcon } from "../OvIcon";
import { Button, CharCount, Textarea } from "@/components/ui";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import {
  MAX_COMMENT_CHARS,
  displayName,
  relativeTime,
} from "@/utils/reviews";
import type { ReviewComment } from "@/utils/types";

type Viewer = {
  username: string | null;
  name: string | null;
  image: string | null;
} | null;

/// Applies `update` to the matching comment anywhere in the one-level tree.
function patchTree(
  comments: ReviewComment[],
  id: string,
  update: (comment: ReviewComment) => ReviewComment
): ReviewComment[] {
  return comments.map((comment) => {
    if (comment.id === id) return update(comment);
    if (comment.replies.length) {
      return { ...comment, replies: patchTree(comment.replies, id, update) };
    }
    return comment;
  });
}

function removeFromTree(comments: ReviewComment[], id: string): ReviewComment[] {
  return comments
    .filter((comment) => comment.id !== id)
    .map((comment) =>
      comment.replies.length
        ? { ...comment, replies: removeFromTree(comment.replies, id) }
        : comment
    );
}

function CommentBox({
  viewer,
  placeholder,
  submitting,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  viewer: Viewer;
  placeholder: string;
  submitting: boolean;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const tooLong = value.length > MAX_COMMENT_CHARS;
  const canSend = value.trim().length > 0 && !tooLong && !submitting;

  if (!viewer) return null;

  return (
    <div className="flex items-start gap-2.5">
      <Avatar author={viewer} size={28} />
      <div className="min-w-0 flex-1">
        <Textarea
          size="sm"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSend) {
              onSubmit(value.trim());
              setValue("");
            }
          }}
          rows={2}
          placeholder={placeholder}
          aria-label={placeholder}
          invalid={tooLong}
        />
        <div className="mt-1.5 flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            icon="send"
            disabled={!canSend}
            loading={submitting}
            onClick={() => {
              onSubmit(value.trim());
              setValue("");
            }}
          >
            {submitting ? "Sending" : "Send"}
          </Button>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <CharCount count={value.length} max={MAX_COMMENT_CHARS} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  viewer,
  isReply,
  replyingTo,
  submitting,
  onLike,
  onDelete,
  onReplyOpen,
  onReplySubmit,
}: {
  comment: ReviewComment;
  viewer: Viewer;
  isReply: boolean;
  replyingTo: string | null;
  submitting: boolean;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onReplyOpen: (id: string | null) => void;
  onReplySubmit: (parentId: string, body: string) => void;
}) {
  return (
    <div className={isReply ? "border-l border-ov-border pl-3.5" : ""}>
      <div className="flex items-start gap-2.5">
        <Avatar author={comment.author} size={isReply ? 24 : 28} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-ui font-semibold text-ov-white">
              {displayName(comment.author)}
            </span>
            <span className="text-micro tracking-wide text-ov-muted">
              {relativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-ui leading-[1.75] text-ov-text">
            {comment.body}
          </p>
          <div className="mt-1.5 flex items-center gap-4">
            <LikeButton
              liked={comment.likedByMe}
              count={comment.likeCount}
              disabled={!viewer}
              size="sm"
              onToggle={() => onLike(comment.id)}
            />
            {viewer && (
              <button
                type="button"
                onClick={() =>
                  onReplyOpen(replyingTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-label text-ov-muted transition-colors duration-150 hover:text-ov-teal"
              >
                <OvIcon name="reply" className="text-label" />
                Reply
              </button>
            )}
            {comment.isMine && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="text-label text-ov-muted transition-colors duration-150 hover:text-ov-rose"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="animate-ov-fade-up mt-3 pl-[38px]">
          <CommentBox
            viewer={viewer}
            autoFocus
            submitting={submitting}
            placeholder={`Reply to ${displayName(comment.author)}...`}
            onCancel={() => onReplyOpen(null)}
            onSubmit={(body) => onReplySubmit(comment.id, body)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-3.5 space-y-3.5 pl-[38px]">
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              viewer={viewer}
              isReply
              replyingTo={replyingTo}
              submitting={submitting}
              onLike={onLike}
              onDelete={onDelete}
              onReplyOpen={onReplyOpen}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  reviewId,
  viewer,
  onCountChange,
}: {
  reviewId: string;
  viewer: Viewer;
  onCountChange: (count: number) => void;
}) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get<{ comments: ReviewComment[] }>(`/api/reviews/${reviewId}/comments`)
      .then((res) => {
        if (!cancelled) setComments(res.data.comments);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  const total = comments.reduce(
    (sum, comment) => sum + 1 + comment.replies.length,
    0
  );

  useEffect(() => {
    if (!loading) onCountChange(total);
  }, [total, loading, onCountChange]);

  const like = useCallback(
    async (id: string) => {
      if (!viewer) return;
      // Optimistic flip, reconciled with the server's settled count.
      setComments((prev) =>
        patchTree(prev, id, (comment) => ({
          ...comment,
          likedByMe: !comment.likedByMe,
          likeCount: comment.likeCount + (comment.likedByMe ? -1 : 1),
        }))
      );
      try {
        const res = await axios.post<{ liked: boolean; likeCount: number }>(
          `/api/comments/${id}/like`
        );
        setComments((prev) =>
          patchTree(prev, id, (comment) => ({
            ...comment,
            likedByMe: res.data.liked,
            likeCount: res.data.likeCount,
          }))
        );
      } catch {
        setComments((prev) =>
          patchTree(prev, id, (comment) => ({
            ...comment,
            likedByMe: !comment.likedByMe,
            likeCount: comment.likeCount + (comment.likedByMe ? -1 : 1),
          }))
        );
      }
    },
    [viewer]
  );

  const remove = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/comments/${id}`);
      setComments((prev) => removeFromTree(prev, id));
    } catch {
      // Leave the comment in place if the delete did not land.
    }
  }, []);

  const post = useCallback(
    async (body: string, parentId?: string) => {
      setSubmitting(true);
      try {
        const res = await axios.post<ReviewComment>(
          `/api/reviews/${reviewId}/comments`,
          { body, parentId }
        );
        const created = res.data;
        setComments((prev) =>
          created.parentId
            ? patchTree(prev, created.parentId, (comment) => ({
                ...comment,
                replies: [...comment.replies, created],
              }))
            : [...prev, created]
        );
        setReplyingTo(null);
      } catch {
        // Keep the draft visible on failure.
      } finally {
        setSubmitting(false);
      }
    },
    [reviewId]
  );

  return (
    // Indented rather than rule-separated, so the thread reads as nested under the
    // review instead of looking like the next item in the feed.
    <div className="mt-4 border-l-2 border-ov-border pl-4">
      {loading ? (
        <div className="text-xs text-ov-muted">
          Loading comments…
        </div>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="mb-4 space-y-4">
              {comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  viewer={viewer}
                  isReply={false}
                  replyingTo={replyingTo}
                  submitting={submitting}
                  onLike={like}
                  onDelete={remove}
                  onReplyOpen={setReplyingTo}
                  onReplySubmit={(parentId, body) => post(body, parentId)}
                />
              ))}
            </div>
          )}

          {viewer ? (
            <CommentBox
              viewer={viewer}
              submitting={submitting}
              placeholder={
                comments.length ? "Add to the thread..." : "Start the discussion..."
              }
              onSubmit={(body) => post(body)}
            />
          ) : (
            <div className="text-xs text-ov-muted">
              Sign in to join the discussion.
            </div>
          )}
        </>
      )}
    </div>
  );
}
