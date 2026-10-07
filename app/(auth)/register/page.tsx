import { auth } from "@/auth";
import { AuthPanel } from "@/components/AuthPanel";
import type { AuthMode } from "@/components/AuthForm";
import { CoverMarquee } from "@/components/overdrive/CoverMarquee";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// Only ever redirect to a same-site path — a bare "callbackUrl" straight from
// the query string could otherwise be used to bounce a signed-in user to an
// attacker-controlled URL.
function safeCallbackUrl(url?: string) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/games";
  return url;
}

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}) {
  const { mode, callbackUrl } = await searchParams;
  const safeCallback = safeCallbackUrl(callbackUrl);

  const session = await auth();
  if (session) redirect(safeCallback);

  const initialMode: AuthMode = mode === "login" ? "login" : "signup";

  return (
    <div className="flex min-h-screen flex-col bg-ov-bg lg:flex-row lg:flex-wrap">
      {/* Phones get a plain header instead of the cover grid below, which is
          too tall and distracting at that width — the form should be the
          first thing visible, not a scroll away. */}
      <div className="flex items-center px-6 py-5 lg:hidden">
        <Link
          href="/games"
          className="font-orbitron text-lg font-black tracking-hud text-ov-teal transition-opacity duration-150 hover:opacity-80"
        >
          GAME//HUB
        </Link>
      </div>

      <div className="relative hidden min-h-[40vh] flex-[1_1_340px] overflow-hidden bg-ov-bg lg:block">
        <Suspense
          fallback={<div className="absolute inset-0 bg-ov-sunken" />}
        >
          <CoverMarquee />
        </Suspense>
        <div className="absolute left-[34px] top-[26px] z-10">
          <Link
            href="/games"
            className="font-orbitron text-lg font-black tracking-hud text-ov-teal transition-opacity duration-150 hover:opacity-80"
          >
            GAME//HUB
          </Link>
        </div>
      </div>

      <div className="flex min-w-[300px] flex-1 flex-[1_1_360px] items-center justify-center border-ov-border bg-ov-sunken px-6 py-8 lg:border-l lg:px-10 lg:py-10">
        <AuthPanel initialMode={initialMode} callbackUrl={safeCallback} />
      </div>
    </div>
  );
}
