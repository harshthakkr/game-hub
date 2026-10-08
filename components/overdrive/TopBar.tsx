"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCollection } from "@/context/CollectionContext";
import { IconButton } from "@/components/ui";
import { cx } from "@/utils/cx";
import { OvIcon } from "./OvIcon";
import { AccountChip } from "./AccountChip";
import { useCommandPalette } from "./CommandPalette";

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
        "flex min-w-0 overflow-x-auto text-sm font-medium [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
      <span className="font-mono text-ui">{count}</span>
    </Link>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const { wishlist, library } = useCollection();
  const palette = useCommandPalette();

  return (
    <header className="sticky top-0 z-40 border-b border-ov-border bg-ov-bg/88 backdrop-blur-[14px]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 md:px-8 xl:gap-6">
        <Link
          href="/"
          aria-label="GAME//HUB home"
          className="shrink-0 font-orbitron text-lg font-extrabold tracking-[0.06em] text-ov-teal transition-opacity duration-150 hover:opacity-80"
        >
          GAME<span className="text-ov-faint">{"//"}</span>HUB
        </Link>

        <NavLinks pathname={pathname} className="hidden h-16 flex-1 gap-[22px] xl:flex" />

        <div className="ml-auto flex items-center gap-1 xl:ml-0">
          {/* Desktop: a search field that opens the palette. Smaller: an icon. */}
          <button
            type="button"
            onClick={palette.open}
            className="mr-2 hidden h-[38px] w-60 items-center gap-2.5 border border-ov-border bg-ov-field px-3 text-sm text-ov-muted transition-colors duration-150 hover:border-ov-border-strong hover:text-ov-dim xl:flex"
          >
            <OvIcon name="search" className="text-base" />
            <span className="flex-1 text-left">Search games</span>
            <kbd className="border border-ov-border-strong px-1.5 font-mono text-label text-ov-dim">
              ⌘K
            </kbd>
          </button>
          <IconButton
            icon="search"
            label="Search"
            onClick={palette.open}
            iconClassName="text-lg"
            className="xl:hidden"
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
      <div className="border-t border-ov-border xl:hidden">
        <NavLinks pathname={pathname} className="mx-auto h-11 max-w-[1440px] gap-6 px-4 md:px-8" />
      </div>
    </header>
  );
}
