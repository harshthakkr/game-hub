import { auth } from "@/auth";
import { AuthPanel } from "@/components/AuthPanel";
import type { AuthMode } from "@/components/AuthForm";
import { CoverMarquee } from "@/components/overdrive/CoverMarquee";
import { OvIcon } from "@/components/overdrive/OvIcon";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// Only ever redirect to a same-site path — a bare "callbackUrl" straight from
// the query string could otherwise be used to bounce a signed-in user to an
// attacker-controlled URL.
function safeCallbackUrl(url?: string) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/";
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
    <div className="grid min-h-screen bg-ov-bg lg:grid-cols-2">
      {/* Cover-art panel. On phones it shrinks to a short banner so the form
          is the first thing in view. */}
      <div className="relative h-[200px] overflow-hidden bg-ov-panel lg:h-auto">
        <div aria-hidden className="absolute -inset-10 -rotate-6 scale-110">
          <Suspense fallback={null}>
            <CoverMarquee />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(5_7_14/0.55),var(--color-ov-bg)_98%),linear-gradient(0deg,rgb(5_7_14/0.9),rgb(5_7_14/0.2)_50%)]" />
        <Link
          href="/"
          aria-label="Close and keep browsing"
          className="absolute top-1.5 right-1.5 flex size-11 items-center justify-center text-ov-white lg:hidden"
        >
          <OvIcon name="close" className="text-xl" />
        </Link>
        <Link
          href="/"
          className="absolute top-4 left-4 font-orbitron text-base font-extrabold tracking-[0.06em] text-ov-teal lg:top-9 lg:left-10 lg:text-xl"
        >
          GAME<span className="text-ov-faint">{"//"}</span>HUB
        </Link>
        <div className="absolute right-10 bottom-10 left-10 hidden max-w-[420px] flex-col gap-2.5 lg:flex">
          <p className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">
            Every game, every price drop, every showcase.
          </p>
          <p className="text-body text-ov-text">
            Track PlayStation Store and Steam prices in INR, follow live events and keep your library in one place.
          </p>
        </div>
      </div>

      <main className="relative -mt-3 flex justify-center px-4 pb-8 lg:mt-0 lg:items-center lg:px-8 lg:py-12">
        <AuthPanel initialMode={initialMode} callbackUrl={safeCallback} />
      </main>
    </div>
  );
}
