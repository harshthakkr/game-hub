"use client";

import { useState } from "react";
import { SignIn } from "@/components/SignIn";
import { AuthForm, type AuthMode } from "@/components/AuthForm";

export function AuthPanel({
  initialMode,
  callbackUrl = "/games",
}: {
  initialMode: AuthMode;
  callbackUrl?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-[360px]">
      <div className="text-label tracking-hud-xwide text-ov-teal">
        {isSignup ? "JOIN THE GRID" : "WELCOME BACK"}
      </div>
      <h1 className="mt-3.5 font-orbitron text-4xl font-black tracking-wide text-white">
        {isSignup ? "SIGN UP" : "LOG IN"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ov-dim">
        {isSignup
          ? "Track releases, sync your library, and get AI-matched recommendations across every platform."
          : "Pick up where you left off — your library, wishlist, and reviews are waiting."}
      </p>

      <div className="mt-7">
        <SignIn
          label={isSignup ? "SIGN UP WITH GOOGLE" : "LOG IN WITH GOOGLE"}
          callbackUrl={callbackUrl}
        />
      </div>

      <div className="my-[22px] flex items-center gap-3">
        <div className="h-px flex-1 bg-ov-border" />
        <span className="text-label tracking-hud-wide text-ov-muted">OR</span>
        <div className="h-px flex-1 bg-ov-border" />
      </div>

      <AuthForm
        mode={mode}
        onToggleMode={() => setMode(isSignup ? "login" : "signup")}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}
