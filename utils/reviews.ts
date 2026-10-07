import type { CSSProperties } from "react";

// Client-safe review constants and helpers. Nothing here may import Prisma —
// these run inside client components alongside the server routes.

export type Verdict =
  | "SKIP"
  | "TIMEPASS"
  | "WORTH_IT"
  | "GO_FOR_IT"
  | "MASTERPIECE";

export interface VerdictMeta {
  value: Verdict;
  label: string;
  blurb: string;
  /// A CSS color (a theme token reference). Components hand it to the
  /// `--verdict` custom property and style with `text-(--verdict)` and friends.
  color: string;
}

/// Ordered worst -> best. The composer, the meter and the filter bar all read
/// this array so the tiers never drift out of sync.
export const VERDICTS: readonly VerdictMeta[] = [
  {
    value: "SKIP",
    label: "SKIP",
    blurb: "Not worth your time",
    color: "var(--color-ov-rose)",
  },
  {
    value: "TIMEPASS",
    label: "TIMEPASS",
    blurb: "Fine on a slow weekend",
    color: "var(--color-ov-dim)",
  },
  {
    value: "WORTH_IT",
    label: "WORTH IT",
    blurb: "Solid — no regrets",
    color: "var(--color-ov-sky)",
  },
  {
    value: "GO_FOR_IT",
    label: "GO FOR IT",
    blurb: "Buy it, play it",
    color: "var(--color-ov-teal)",
  },
  {
    value: "MASTERPIECE",
    label: "MASTERPIECE",
    blurb: "An all-timer",
    color: "var(--color-ov-amber)",
  },
] as const;

export const VERDICT_VALUES = VERDICTS.map((v) => v.value);

const FALLBACK_VERDICT: VerdictMeta = {
  value: "WORTH_IT",
  label: "WORTH IT",
  blurb: "",
  color: "var(--color-ov-muted)",
};

export function verdictMeta(verdict: string): VerdictMeta {
  return VERDICTS.find((v) => v.value === verdict) ?? FALLBACK_VERDICT;
}

/// Inline style that exposes a verdict's color as `--verdict`.
export function verdictVars(color: string) {
  return { "--verdict": color } as CSSProperties;
}

export function isVerdict(value: unknown): value is Verdict {
  return typeof value === "string" && VERDICT_VALUES.includes(value as Verdict);
}

export const MAX_REVIEW_WORDS = 1000;
export const MAX_COMMENT_CHARS = 600;
export const REVIEWS_PER_PAGE = 10;

export function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export type ReviewSort = "latest" | "liked" | "discussed";

export const REVIEW_SORTS: { value: ReviewSort; label: string }[] = [
  { value: "latest", label: "LATEST" },
  { value: "liked", label: "MOST LIKED" },
  { value: "discussed", label: "MOST DISCUSSED" },
];

export function isReviewSort(value: unknown): value is ReviewSort {
  return value === "latest" || value === "liked" || value === "discussed";
}

/// Modal tier across all reviews. Ties resolve to the more positive tier.
export function consensusVerdict(
  counts: Record<Verdict, number>
): Verdict | null {
  let best: Verdict | null = null;
  let bestCount = 0;
  for (const { value } of VERDICTS) {
    const count = counts[value] ?? 0;
    if (count > 0 && count >= bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function displayName(author: {
  username?: string | null;
  name?: string | null;
}) {
  return author.username || author.name || "player";
}

/// A single letter — two initials off a handle like "neon_drifter" read as noise.
export function initials(author: {
  username?: string | null;
  name?: string | null;
}) {
  return displayName(author).trim().charAt(0).toUpperCase() || "?";
}

const UNITS: [limit: number, div: number, suffix: string][] = [
  [60, 1, "s"],
  [3600, 60, "m"],
  [86400, 3600, "h"],
  [2592000, 86400, "d"],
  [31536000, 2592000, "mo"],
  [Infinity, 31536000, "y"],
];

export function relativeTime(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 45) return "just now";
  for (const [limit, div, suffix] of UNITS) {
    if (seconds < limit) return `${Math.floor(seconds / div)}${suffix} ago`;
  }
  return "a while ago";
}

/// Username rules shared by the signup form and the register route.
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export const USERNAME_HINT =
  "3-20 characters — lowercase letters, numbers and underscores only.";
