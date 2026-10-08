"use client";

import { useState } from "react";
import Link from "next/link";
import { SignIn } from "@/components/SignIn";
import { AuthForm, type AuthMode } from "@/components/AuthForm";
import { ChipGroup } from "@/components/ui";

const MODES = [
  { value: "login" as AuthMode, label: "Sign in" },
  { value: "signup" as AuthMode, label: "Create account" },
];

export function AuthPanel({
  initialMode,
  callbackUrl = "/",
}: {
  initialMode: AuthMode;
  callbackUrl?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isSignup = mode === "signup";

  return (
    <div className="flex w-full max-w-[420px] animate-ov-fade-up flex-col gap-5.5">
      <ChipGroup label="Account" variant="segmented" options={MODES} value={mode} onValueChange={setMode} className="w-max" />
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em]">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-body leading-normal text-ov-dim">
          {isSignup
            ? "Track prices, keep a wishlist and library, and review the games you play."
            : "Pick up where you left off: your library, wishlist and reviews are waiting."}
        </p>
      </div>

      <SignIn callbackUrl={callbackUrl} />

      <div className="flex items-center gap-3 text-ui text-ov-muted">
        <span className="h-px flex-1 bg-ov-border" />
        or with email
        <span className="h-px flex-1 bg-ov-border" />
      </div>

      <AuthForm mode={mode} onToggleMode={() => setMode(isSignup ? "login" : "signup")} callbackUrl={callbackUrl} />

      <Link href="/" className="text-center text-ui text-ov-muted hover:text-ov-text">
        Continue browsing without an account
      </Link>
    </div>
  );
}
