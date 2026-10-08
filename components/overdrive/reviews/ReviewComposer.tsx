"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { ToggleGroup } from "radix-ui";
import { OvIcon } from "../OvIcon";
import { Button, CharCount, Switch, Textarea } from "@/components/ui";
import {
  MAX_REVIEW_WORDS,
  VERDICTS,
  countWords,
  verdictMeta,
  verdictVars,
  type Verdict,
} from "@/utils/reviews";
import type { ReviewProps } from "@/utils/types";

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? fallback;
  }
  return fallback;
}

export function ReviewComposer({
  gameId,
  gameSlug,
  gameName,
  viewer,
  myReview,
  onSaved,
  onDeleted,
}: {
  gameId: number;
  gameSlug: string;
  gameName: string;
  viewer: { username: string | null; name: string | null; image: string | null } | null;
  myReview: ReviewProps | null;
  onSaved: (review: ReviewProps) => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(!myReview);
  const [verdict, setVerdict] = useState<Verdict | null>(
    myReview?.verdict ?? null
  );
  const [body, setBody] = useState(myReview?.body ?? "");
  const [hasSpoilers, setHasSpoilers] = useState(myReview?.hasSpoilers ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = countWords(body);
  const overLimit = words > MAX_REVIEW_WORDS;
  const canSubmit = !!verdict && words > 0 && !overLimit && !saving;
  const selected = verdict ? verdictMeta(verdict) : null;

  if (!viewer) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border border-ov-border bg-ov-panel p-4.5">
        <p className="text-body text-ov-text">Sign in to write a review.</p>
        <Button asChild variant="primary" size="sm" chamfer>
          <Link href={`/register?mode=login&callbackUrl=${encodeURIComponent(`/games/${gameSlug}`)}`}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  if (myReview && !open) {
    const meta = verdictMeta(myReview.verdict);
    return (
      <div className="flex flex-wrap items-center gap-3 border border-ov-border bg-ov-panel p-4.5">
        <OvIcon name="check" className="text-base text-ov-teal" />
        <p className="text-body text-ov-text">
          You called it{" "}
          <span className="font-semibold text-(--verdict)" style={verdictVars(meta.color)}>
            {meta.label}
          </span>
        </p>
        <Button size="sm" variant="outline" icon="edit" onClick={() => setOpen(true)} className="ml-auto">
          Edit review
        </Button>
      </div>
    );
  }

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await axios.post<ReviewProps>("/api/reviews", {
        gameId,
        gameSlug,
        gameName,
        body,
        verdict,
        hasSpoilers,
      });
      onSaved(res.data);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err, "Could not save your review."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!myReview) return;
    setSaving(true);
    setError(null);
    try {
      await axios.delete(`/api/reviews/${myReview.id}`);
      setBody("");
      setVerdict(null);
      setHasSpoilers(false);
      onDeleted();
    } catch (err) {
      setError(errorMessage(err, "Could not delete your review."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 border border-ov-border bg-ov-panel p-4.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span id="verdict-label" className="mr-1.5 text-body font-semibold">
          {myReview ? "Update your verdict" : "Your verdict"}
        </span>
        {/* Same ToggleGroup primitive as ChipGroup (roving focus, arrow keys),
            but each tier lights up in its own verdict color. */}
        <ToggleGroup.Root
          type="single"
          aria-labelledby="verdict-label"
          value={verdict ?? ""}
          onValueChange={(next) => next && setVerdict(next as Verdict)}
          className="flex flex-wrap gap-2"
        >
          {VERDICTS.map((tier) => (
            <ToggleGroup.Item
              key={tier.value}
              value={tier.value}
              title={tier.blurb}
              style={verdictVars(tier.color)}
              className="flex items-center gap-1.5 border border-ov-border-strong px-3 py-1.5 text-ui font-medium text-ov-dim transition-colors duration-150 hover:text-ov-white data-[state=on]:border-(--verdict) data-[state=on]:bg-ov-raised data-[state=on]:text-(--verdict)"
            >
              <span aria-hidden className="size-1.5 rotate-45 bg-(--verdict)" />
              {tier.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
      {selected && <p className="-mt-1 text-ui text-ov-muted">{selected.blurb}</p>}

      <Textarea
        id="review-body"
        aria-label="Your review"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="What worked, what didn't, who should play it?"
        invalid={overLimit}
      />

      {error && (
        <p role="alert" className="border-l-2 border-ov-rose py-1 pl-3 text-sm text-ov-rose-soft">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Switch checked={hasSpoilers} onCheckedChange={setHasSpoilers}>
          Contains spoilers
        </Switch>
        <CharCount count={words} max={MAX_REVIEW_WORDS} unit="words" />
        <div className="ml-auto flex items-center gap-2">
          {myReview && (
            <>
              <Button variant="danger" size="sm" onClick={remove} disabled={saving}>
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBody(myReview.body);
                  setVerdict(myReview.verdict);
                  setHasSpoilers(myReview.hasSpoilers);
                  setError(null);
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
          <Button variant="primary" onClick={submit} disabled={!canSubmit} loading={saving}>
            {myReview ? "Update review" : "Post review"}
          </Button>
        </div>
      </div>
    </div>
  );
}
