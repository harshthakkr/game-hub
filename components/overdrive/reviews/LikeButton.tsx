"use client";

import { OvIcon } from "../OvIcon";
import { cx } from "@/utils/cx";

/// Thumbs-up with a count. The heart is reserved for the wishlist, so likes
/// get their own symbol.
export function LikeButton({
  liked,
  count,
  onToggle,
  disabled,
}: {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={disabled ? "Sign in to like" : undefined}
      aria-pressed={liked}
      aria-label={`${liked ? "Unlike" : "Like"}, ${count} ${count === 1 ? "like" : "likes"}`}
      className={cx(
        "flex items-center gap-1.5 text-ui transition-colors duration-150 hover:text-ov-white disabled:cursor-default disabled:hover:text-inherit",
        liked ? "text-ov-teal" : "text-ov-dim"
      )}
    >
      <OvIcon name={liked ? "thumbs-up-filled" : "thumbs-up"} className="text-sm" />
      {count}
    </button>
  );
}
