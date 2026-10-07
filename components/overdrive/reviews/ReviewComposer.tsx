"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { OvIcon } from "../OvIcon";
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
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(`/games/${gameSlug}`)}`}
          className="ov-chamfer-x ov-chamfer-sm mt-5 inline-block px-5 py-2.5 font-orbitron text-label font-bold tracking-hud-wide transition-transform duration-150 hover:brightness-110 active:scale-95 bg-linear-to-b from-ov-teal to-ov-teal-dark text-ov-bg"
        >
          JOIN THE GRID
        </Link>
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
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto border border-ov-border px-3 py-1.5 text-label tracking-hud text-ov-dim transition-all duration-150 hover:border-ov-teal hover:text-ov-teal active:scale-95"
        >
          <OvIcon name="edit" className="mr-1 text-label" />
          EDIT
        </button>
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

      <div className="mt-5 mb-2 text-label tracking-hud-wide text-ov-dim">
        YOUR VERDICT
      </div>
      <div className="flex flex-wrap gap-2">
        {VERDICTS.map((tier) => {
          const active = verdict === tier.value;
          return (
            <button
              key={tier.value}
              type="button"
              onClick={() => setVerdict(tier.value)}
              aria-pressed={active}
              className={`ov-chamfer-x ov-chamfer-sm border px-3 py-2 font-orbitron text-micro font-bold tracking-hud-wide transition-all duration-150 hover:brightness-125 active:scale-95 ${
                active
                  ? "border-(--verdict) bg-(--verdict)/9 text-(--verdict)"
                  : "border-ov-border bg-transparent text-ov-dim"
              }`}
              style={verdictVars(tier.color)}
            >
              {tier.label}
            </button>
          );
        })}
      </div>
      <div className="mt-2 h-4 text-label italic text-ov-muted">
        {selected ? `// ${selected.blurb}` : ""}
      </div>

      <div className="mt-4 mb-2 flex items-baseline gap-3">
        <span className="text-label tracking-hud-wide text-ov-dim">REVIEW</span>
        <span
          className={`ml-auto font-orbitron text-label font-bold ${
            overLimit ? "text-ov-rose" : "text-ov-muted"
          }`}
        >
          {words} / {MAX_REVIEW_WORDS} WORDS
        </span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={7}
        placeholder="What worked, what didn't, who should play it..."
        aria-label="Review"
        aria-invalid={overLimit}
        className={`ov-chamfer-x block w-full resize-y border bg-ov-sunken px-4 py-3 text-sm leading-[1.8] text-ov-white outline-none transition-colors duration-150 placeholder:text-ov-muted ${
          overLimit ? "border-ov-rose" : "border-ov-border focus:border-ov-teal"
        }`}
      />

      <button
        type="button"
        onClick={() => setHasSpoilers((v) => !v)}
        aria-pressed={hasSpoilers}
        className="mt-3.5 flex items-center gap-2.5 transition-transform duration-150 active:scale-95"
      >
        <span
          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border text-ov-rose transition-colors duration-150 ${
            hasSpoilers ? "border-ov-rose bg-ov-rose/16" : "border-ov-border bg-transparent"
          }`}
        >
          {hasSpoilers && <OvIcon name="check" className="text-label" />}
        </span>
        <span
          className={`text-label tracking-hud ${hasSpoilers ? "text-ov-rose" : "text-ov-dim"}`}
        >
          THIS REVIEW CONTAINS SPOILERS
        </span>
      </button>

      {error && (
        <div className="animate-ov-fade-up mt-3.5 border-l-2 border-ov-rose py-1.5 pl-3.5 text-xs text-ov-rose">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="ov-chamfer-x ov-chamfer-sm px-5 py-3 font-orbitron text-label font-bold tracking-hud-wide transition-all duration-150 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:active:scale-100 bg-linear-to-b from-ov-teal to-ov-teal-dark text-ov-bg"
        >
          {saving ? "SAVING..." : myReview ? "UPDATE REVIEW" : "POST REVIEW"}
        </button>

        {myReview && (
          <>
            <button
              type="button"
              onClick={() => {
                setBody(myReview.body);
                setVerdict(myReview.verdict);
                setHasSpoilers(myReview.hasSpoilers);
                setError(null);
                setOpen(false);
              }}
              className="px-4 py-3 text-label tracking-hud text-ov-muted transition-colors duration-150 hover:text-ov-text"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={remove}
              className="ml-auto border border-ov-rose px-4 py-2.5 text-label tracking-hud text-ov-rose transition-colors duration-150 hover:bg-ov-rose hover:text-ov-bg active:scale-95"
            >
              DELETE
            </button>
          </>
        )}
      </div>
    </div>
  );
}
