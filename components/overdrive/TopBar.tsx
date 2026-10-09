"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useCollection } from "@/context/CollectionContext";
import { IconButton } from "@/components/ui";
import { cx } from "@/utils/cx";
import { OvIcon } from "./OvIcon";
import { AccountChip } from "./AccountChip";
import { useCommandPalette } from "./CommandPalette";
import { useScreenTitleValue } from "./ScreenTitle";
import { Avatar } from "./reviews/Avatar";
import type { EventCardProps } from "@/utils/types";
import { eventTiming } from "@/utils/overdrive";
import { usePagePath } from "@/utils/hooks/usePagePath";

/// Routes shown as pushed screens on phones: a back button and the screen's
/// title replace the logo.
const PUSHED = /^\/(games|events|developers|genres|platforms)\/[^/]+/;
/// Pushed screens that bring their own sticky action bar instead of tabs.
const NO_TABS = /^\/games\/[^/]+/;

export function hidesTabBar(pathname: string) {
  return NO_TABS.test(pathname);
}

const NAV = [
  { label: "Discover", href: "/" },
  { label: "Catalogue", href: "/games" },
  { label: "Events", href: "/events" },
  { label: "Platforms", href: "/platforms" },
  { label: "Genres", href: "/genres" },
  { label: "Developers", href: "/developers" },
  { label: "Concierge", href: "/ai" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/games") return pathname.startsWith("/games") || pathname === "/search";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, className }: { pathname: string; className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={cx(
        // Caps, tracked: the nav speaks in the HUD voice.
        "flex min-w-0 overflow-x-auto text-ui font-semibold tracking-[0.08em] uppercase [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {NAV.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex shrink-0 items-center whitespace-nowrap transition-colors duration-150 hover:text-ov-white",
              active
                ? "text-ov-white shadow-[inset_0_-2px_0_var(--color-ov-teal)]"
                : "text-ov-dim"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/// Wishlist / library shortcut: an icon and its count.
function CountLink({
  href,
  label,
  count,
  icon,
  active,
}: {
  href: string;
  label: string;
  count: number;
  icon: "heart" | "library";
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={`${label}, ${count} ${count === 1 ? "game" : "games"}`}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex h-10 items-center gap-1.5 px-2.5 transition-colors duration-150 hover:bg-ov-field hover:text-ov-white",
        active ? "text-ov-white" : "text-ov-dim"
      )}
    >
      <OvIcon name={icon} className={cx("text-lg", icon === "heart" && "text-ov-rose")} />
      <span className="font-hud text-ui">{count}</span>
    </Link>
  );
}

/// Phone top bar (below lg): logo or back + title, search, account.
function PhoneTopBar({ pathname }: { pathname: string }) {
  const router = useRouter();
  const palette = useCommandPalette();
  const title = useScreenTitleValue();
  const { data: session } = useSession();
  const pushed = PUSHED.test(pathname);

  return (
    <div className="flex h-14 items-center gap-1 pr-1.5 pl-4 lg:hidden">
      {pushed ? (
        <>
          <IconButton
            icon="chevron-left"
            label="Back"
            iconClassName="text-xl"
            size="lg"
            className="-ml-3"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          />
          <span className="min-w-0 flex-1 truncate text-body font-semibold">{title}</span>
        </>
      ) : (
        <>
          <Link
            href="/"
            aria-label="GAME//HUB home"
            className="font-orbitron text-base font-extrabold tracking-[0.06em] text-ov-teal"
          >
            GAME<span className="text-ov-faint">{"//"}</span>HUB
          </Link>
          <span className="flex-1" />
        </>
      )}
      <IconButton icon="search" label="Search" onClick={palette.open} iconClassName="text-xl" size="lg" />
      {!pushed &&
        (session?.user ? (
          <Link href="/wishlist" aria-label="Your saved games" className="flex size-11 items-center justify-center">
            <span className="ov-chamfer ov-chamfer-sm">
              <Avatar
                author={{
                  username: session.user.username ?? null,
                  name: session.user.name ?? null,
                  image: session.user.image ?? null,
                }}
                size={30}
              />
            </span>
          </Link>
        ) : (
          <Link
            href={`/register?mode=login&callbackUrl=${encodeURIComponent(pathname)}`}
            className="flex h-11 items-center px-2.5 text-ui font-semibold tracking-[0.08em] text-ov-teal uppercase"
          >
            Sign in
          </Link>
        ))}
    </div>
  );
}

const TABS: { label: string; href: string; icon: "grid" | "list" | "clock" | "sparkles" | "heart"; match: (p: string) => boolean }[] = [
  { label: "Discover", href: "/", icon: "grid", match: (p) => p === "/" },
  {
    label: "Catalogue",
    href: "/games",
    icon: "list",
    match: (p) => /^\/(games|search|platforms|genres|developers)/.test(p),
  },
  { label: "Events", href: "/events", icon: "clock", match: (p) => p.startsWith("/events") },
  { label: "Concierge", href: "/ai", icon: "sparkles", match: (p) => p.startsWith("/ai") },
  { label: "Saved", href: "/wishlist", icon: "heart", match: (p) => p === "/wishlist" || p === "/library" },
];

/// Whether any event is live right now, for the dot on the Events tab.
function useAnyLive() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    axios
      .get<EventCardProps[]>("/api/events?upcoming=1")
      .then((res) => setLive(res.data.some((e) => eventTiming(e.start_time, e.end_time).state === "live")))
      .catch(() => {});
  }, []);
  return live;
}

/// Phone navigation: five destinations one thumb-tap away. Platforms, Genres
/// and Developers live under Catalogue; search and account sit in the top bar.
export function BottomTabBar() {
  const pathname = usePagePath();
  const anyLive = useAnyLive();
  if (hidesTabBar(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      // Background spans the screen; the five tabs stay a compact centred
      // group on tablets (capped columns) rather than spreading apart.
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[repeat(5,minmax(0,112px))] justify-center border-t border-ov-border bg-ov-bg/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px] lg:hidden"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "relative flex h-16 flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-ov-white" : "text-ov-muted hover:text-ov-text"
            )}
          >
            <span
              aria-hidden
              className={cx("absolute -top-px right-[22%] left-[22%] h-0.5", active ? "bg-ov-teal" : "bg-transparent")}
            />
            <span className="relative">
              <OvIcon name={tab.icon} className="text-xl" />
              {tab.href === "/events" && anyLive && (
                <span className="absolute -top-0.5 -right-1 size-2 rounded-full border-2 border-ov-bg bg-ov-rose">
                  <span className="sr-only"> (live now)</span>
                </span>
              )}
            </span>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopBar() {
  const pathname = usePagePath();
  const { wishlist, library } = useCollection();
  const palette = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-ov-border bg-ov-bg/88 backdrop-blur-[14px]">
      <PhoneTopBar pathname={pathname} />
      <div className="mx-auto hidden h-16 max-w-[1440px] items-center gap-4 px-8 lg:flex 2xl:gap-6">
        <Link
          href="/"
          aria-label="GAME//HUB home"
          className="shrink-0 font-orbitron text-lg font-extrabold tracking-[0.06em] text-ov-teal transition-opacity duration-150 hover:opacity-80"
        >
          GAME<span className="text-ov-faint">{"//"}</span>HUB
        </Link>

        {/* Single-row header from xl. Until 2xl the caps nav needs the room, so
            items sit closer and search collapses to an icon (same palette, ⌘K
            still works); the full search field returns at 2xl. */}
        <NavLinks pathname={pathname} className="hidden h-16 flex-1 gap-4 xl:flex 2xl:gap-[22px]" />

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          {/* Wide desktop: a search field that opens the palette. Smaller: an icon. */}
          <button
            type="button"
            onClick={palette.open}
            className="mr-2 hidden h-[38px] w-60 items-center gap-2.5 border border-ov-border bg-ov-field px-3 text-sm text-ov-muted transition-colors duration-150 hover:border-ov-border-strong hover:text-ov-dim 2xl:flex"
          >
            <OvIcon name="search" className="text-base" />
            <span className="flex-1 text-left">Search the grid</span>
            <kbd className="border border-ov-border-strong px-1.5 font-hud text-label text-ov-dim">
              ⌘K
            </kbd>
          </button>
          <IconButton
            icon="search"
            label="Search"
            onClick={palette.open}
            iconClassName="text-lg"
            className="2xl:hidden"
          />
          <CountLink
            href="/wishlist"
            label="Wishlist"
            count={wishlist.length}
            icon="heart"
            active={pathname === "/wishlist"}
          />
          <CountLink
            href="/library"
            label="Library"
            count={library.length}
            icon="library"
            active={pathname === "/library"}
          />
          <div className="ml-1.5">
            <AccountChip />
          </div>
        </div>
      </div>

      {/* Below xl the primary nav gets its own scrollable row instead of a
          hamburger, so every section stays one tap away. */}
      <div className="hidden border-t border-ov-border lg:block xl:hidden">
        <NavLinks pathname={pathname} className="mx-auto h-11 max-w-[1440px] gap-6 px-8" />
      </div>
    </header>
  );
}
