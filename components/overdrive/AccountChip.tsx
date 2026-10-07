"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "./reviews/Avatar";
import { displayName } from "@/utils/reviews";

/// Top-bar account slot: the log-in CTA when signed out; when signed in, the
/// avatar reveals a menu on hover (and on click, for touch) holding sign-out.
export function AccountChip() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="h-[30px] w-[30px] animate-ov-pulse bg-ov-raised" />;
  }

  if (!session?.user) {
    return (
      <Link
        href={`/register?mode=login&callbackUrl=${encodeURIComponent(pathname || "/games")}`}
        className="ov-chamfer-x ov-chamfer-sm font-orbitron text-micro font-bold transition-transform duration-150 hover:brightness-110 active:scale-95 bg-linear-to-b from-ov-teal to-ov-teal-dark text-ov-bg px-4 py-[11px] tracking-hud"
      >
        LOG IN
      </Link>
    );
  }

  const user = {
    username: session.user.username ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
  const handle = displayName(user);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80"
      >
        <Avatar author={user} size={30} />
        <span className="hidden max-w-[110px] truncate text-xs text-ov-text lg:inline">
          {handle}
        </span>
      </button>

      {open && (
        // No gap between trigger and menu: an 8px dead zone would fire
        // mouseleave on the way down. The pt-2 spacer stays inside the hover area.
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="animate-ov-pop origin-top-right min-w-[190px] border border-ov-border bg-ov-panel shadow-ov-pop">
            <div className="border-b border-ov-border px-3.5 py-2.5">
              <div className="truncate text-xs text-ov-white">{handle}</div>
              {session.user.email && (
                <div className="mt-0.5 truncate text-micro text-ov-muted">
                  {session.user.email}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/games" })}
              className="w-full px-3.5 py-2.5 text-left text-label tracking-hud text-ov-dim transition-colors hover:bg-ov-raised hover:text-ov-rose"
            >
              SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
