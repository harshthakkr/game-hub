"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { ToggleGroup } from "radix-ui";
import { OvIcon } from "../OvIcon";
import { Button, CharCount, Checkbox, Textarea } from "@/components/ui";
import { Avatar } from "./Avatar";
import {
  MAX_REVIEW_WORDS,
  VERDICTS,
  countWords,
  displayName,
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
      <div className="py-2 text-center">
        <div className="font-orbitron text-sm font-bold tracking-hud-wide text-ov-text">
          SIGN IN TO POST A REVIEW
        </div>
        <p className="mx-auto mt-2.5 max-w-[420px] text-ui leading-relaxed text-ov-muted">
          Reviews are tied to a player handle so other players know whose call
          they are reading. Reading is open to everyone.
        </p>
        <Button asChild variant="primary" className="mt-5">
          <Link href={`/register?callbackUrl=${encodeURIComponent(`/games/${gameSlug}`)}`}>
            JOIN THE GRID
          </Link>
        </Button>
      </div>
    );
  }

  if (myReview && !open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <OvIcon name="check" className="text-sm text-ov-teal" />
        <span className="text-ui text-ov-text">
          You reviewed {gameName} —{" "}
          <span
            className="text-(--verdict)"
            style={verdictVars(verdictMeta(myReview.verdict).color)}
          >
            {verdictMeta(myReview.verdict).label}
          </span>
        </span>
        <Button size="sm" variant="outline" icon="edit" onClick={() => setOpen(true)} className="ml-auto">
          EDIT
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
    <div>
      <div className="flex items-center gap-3">
        <Avatar author={viewer} size={34} />
        <div className="min-w-0">
          <div className="font-orbitron text-xs font-bold tracking-hud-wide text-ov-rose">
            {myReview ? "EDIT YOUR REVIEW" : "WRITE A REVIEW"}
          </div>
          <div className="mt-0.5 text-label text-ov-muted">
            posting as {displayName(viewer)}
          </div>
        </div>
      </div>

      <div aria-hidden className="mt-5 mb-2 text-label tracking-hud-wide text-ov-dim">
        YOUR VERDICT
      </div>
      {/* Same ToggleGroup primitive as ChipGroup (roving focus, arrow keys), but
          each tier lights up in its own verdict color. */}
      <ToggleGroup.Root
        type="single"
        aria-label="Your verdict"
        value={verdict ?? ""}
        onValueChange={(next) => next && setVerdict(next as Verdict)}
        className="flex flex-wrap gap-2"
      >
        {VERDICTS.map((tier) => (
          <ToggleGroup.Item
            key={tier.value}
            value={tier.value}
            style={verdictVars(tier.color)}
            className="ov-chamfer-x ov-chamfer-sm border border-ov-border px-3 py-2 font-orbitron text-micro font-bold tracking-hud-wide text-ov-dim transition-[filter,background-color,border-color,color,scale] duration-150 hover:brightness-125 active:scale-95 data-[state=on]:border-(--verdict) data-[state=on]:bg-(--verdict)/9 data-[state=on]:text-(--verdict)"
          >
            {tier.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <div className="mt-2 h-4 text-label italic text-ov-muted">
        {selected ? `// ${selected.blurb}` : ""}
      </div>

      <div className="mt-4 mb-2 flex items-baseline gap-3">
        <label htmlFor="review-body" className="text-label tracking-hud-wide text-ov-dim">
          REVIEW
        </label>
        <CharCount count={words} max={MAX_REVIEW_WORDS} unit="WORDS" className="ml-auto" />
      </div>
      <Textarea
        id="review-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={7}
        placeholder="What worked, what didn't, who should play it..."
        invalid={overLimit}
        className="ov-chamfer-x"
      />

      <Checkbox tone="rose" checked={hasSpoilers} onCheckedChange={setHasSpoilers} className="mt-3.5">
        THIS REVIEW CONTAINS SPOILERS
      </Checkbox>

      {error && (
        <div
          role="alert"
          className="animate-ov-fade-up mt-3.5 border-l-2 border-ov-rose py-1.5 pl-3.5 text-xs text-ov-rose"
        >
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={submit} disabled={!canSubmit} loading={saving}>
          {saving ? "SAVING" : myReview ? "UPDATE REVIEW" : "POST REVIEW"}
        </Button>

        {myReview && (
          <>
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
              CANCEL
            </Button>
            <Button variant="danger" size="sm" onClick={remove} disabled={saving} className="ml-auto">
              DELETE
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
