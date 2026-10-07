"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCollection } from "@/context/CollectionContext";
import { GameCardProps } from "@/utils/types";
import { coverUrl, formatRating, formatYear } from "@/utils/overdrive";
import { OvIcon } from "./OvIcon";
import { AccountChip } from "./AccountChip";
import { SearchResultsSkeleton } from "./Skeletons";
import { IconButton } from "@/components/ui";
import Image from "next/image";

const NAV = [
  { label: "Games", href: "/games" },
  { label: "Events", href: "/events" },
  { label: "Platforms", href: "/platforms" },
  { label: "Genres", href: "/genres" },
  { label: "Developers", href: "/developers" },
  { label: "Chat", href: "/ai" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/games") {
    return (
      pathname === "/games" ||
      pathname.startsWith("/games/") ||
      pathname === "/search"
    );
  }
  if (href === "/events") {
    return pathname === "/events" || pathname.startsWith("/events/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap border-b-2 pb-1 transition-colors duration-150 hover:opacity-80 ${
        active ? "border-ov-teal text-ov-teal" : "border-transparent text-ov-text"
      }`}
    >
      {label}
    </Link>
  );
}

type SearchBoxProps = {
  query: string;
  setQuery: (v: string) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;
  results: GameCardProps[];
  searching: boolean;
  goSearch: () => void;
  innerRef: React.RefObject<HTMLDivElement | null>;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
};

function SearchBox({
  query,
  setQuery,
  dropdownOpen,
  setDropdownOpen,
  results,
  searching,
  goSearch,
  innerRef,
  inputRef,
  className = "",
}: SearchBoxProps) {
  return (
    <div ref={innerRef} className={`relative ${className}`}>
      <div
        className={`ov-chamfer-x flex items-center gap-2.5 border bg-ov-panel px-3.5 py-2 transition-colors duration-200 focus-within:border-ov-teal ${
          query ? "border-ov-teal" : "border-ov-border"
        }`}
      >
        <OvIcon name="search" className="shrink-0 text-sm text-ov-teal" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => query.trim() && setDropdownOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && goSearch()}
          placeholder="SEARCH THE GRID"
          aria-label="Search games"
          className="min-w-0 flex-1 border-none bg-transparent text-ui tracking-wide text-ov-white outline-none placeholder:text-ov-muted"
        />
        {query && (
          <IconButton icon="close" label="Clear search" onClick={() => setQuery("")} />
        )}
      </div>

      {dropdownOpen && query.trim() && (
        <div className="animate-ov-pop absolute left-0 right-0 top-[calc(100%+8px)] z-[60] max-h-[360px] origin-top overflow-y-auto border border-ov-teal bg-ov-panel shadow-ov-pop">
          {searching && <SearchResultsSkeleton />}
          {!searching && results.length === 0 && (
            <div className="px-3.5 py-4 text-center text-xs text-ov-muted">
              No games match “{query.trim()}”.
            </div>
          )}
          {!searching &&
            results.slice(0, 6).map((game) => {
              const cover = coverUrl(game.cover);
              return (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  onClick={() => {
                    setQuery("");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 border-b border-ov-border px-3 py-2.5 transition-colors duration-150 hover:bg-ov-raised"
                >
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      width={30}
                      height={40}
                      className="h-10 w-[30px] shrink-0 border border-ov-border object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-ui text-white">{game.name}</div>
                    <div className="text-micro uppercase tracking-wide text-ov-muted">
                      {game.genres?.[0]?.name || "Game"} · {formatYear(game.first_release_date)}
                    </div>
                  </div>
                  <span className="ml-auto font-orbitron text-xs font-bold text-ov-teal">
                    {formatRating(game.aggregated_rating)}
                  </span>
                </Link>
              );
            })}
          {!searching && results.length > 0 && (
            <button
              type="button"
              onClick={goSearch}
              className="flex w-full items-center justify-center px-3 py-2.5 text-label tracking-hud-wide text-ov-teal transition-colors duration-150 hover:bg-ov-raised"
            >
              SEE ALL RESULTS
              <OvIcon name="chevron-right" className="ml-1 text-xs" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { wishlist, library } = useCollection();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [results, setResults] = useState<GameCardProps[]>([]);
  const [searching, setSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    // Flip to searching as soon as the query changes so the dropdown shows
    // progress through the debounce window too, not just the request itself.
    setSearching(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        setResults(res.data.filter((g: GameCardProps) => g.cover));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = desktopSearchRef.current?.contains(target);
      const inMobile = mobileSearchRef.current?.contains(target);
      if (!inDesktop && !inMobile) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close the mobile search row automatically once the viewport grows into
  // the desktop layout, so it can't be left open behind the inline search.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1080px)");
    const handler = () => setMobileSearchOpen(false);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) mobileInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const goSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setDropdownOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const searchBoxCommonProps = {
    query,
    setQuery,
    dropdownOpen,
    setDropdownOpen,
    results,
    searching,
    goSearch,
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ov-border bg-ov-bg/92 backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:gap-4 lg:px-6 lg:py-4">
        <Link
          href="/games"
          className="shrink-0 font-orbitron text-body font-black tracking-hud text-ov-teal transition-opacity duration-150 hover:opacity-80 sm:text-lg"
        >
          GAME//HUB
        </Link>

        {/* Desktop (xl+): nav, search and the wishlist/library links share one row. */}
        <div className="hidden min-w-0 flex-1 items-center gap-4 xl:flex 2xl:gap-6">
          <nav
            aria-label="Primary"
            className="flex shrink-0 gap-3.5 text-ui uppercase tracking-hud 2xl:gap-5"
          >
            {NAV.map((item) => (
              <NavLink key={item.href} {...item} active={isNavActive(pathname, item.href)} />
            ))}
          </nav>

          <SearchBox
            {...searchBoxCommonProps}
            innerRef={desktopSearchRef}
            className="min-w-[140px] max-w-[360px] flex-1 2xl:max-w-[440px]"
          />

          <Link
            href="/wishlist"
            title="Wishlist"
            className="flex shrink-0 items-center gap-1.5 text-ov-rose transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <OvIcon name="heart" className="text-sm" />
            <span className="hidden text-label tracking-hud text-ov-text 2xl:inline">
              WISHLIST
            </span>
            <span className="font-orbitron text-label font-bold text-ov-text">
              {wishlist.length}
            </span>
          </Link>

          <Link
            href="/library"
            title="Library"
            className="flex shrink-0 items-center gap-1.5 text-ov-teal transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <OvIcon name="library" className="text-body" />
            <span className="hidden text-label tracking-hud text-ov-text 2xl:inline">
              LIBRARY
            </span>
            <span className="font-orbitron text-label font-bold text-ov-text">
              {library.length}
            </span>
          </Link>
        </div>

        {/* Below xl: a compact icon cluster replaces the inline nav/search/links. */}
        <div className="ml-auto flex items-center gap-4 sm:gap-5 xl:hidden">
          <IconButton
            icon={mobileSearchOpen ? "close" : "search"}
            label={mobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((v) => !v)}
            iconClassName="text-lg"
          />

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} games`}
            className="flex items-center gap-1 text-ov-rose transition-transform duration-150 active:scale-90"
          >
            <OvIcon name="heart" className="text-base" />
            <span className="font-orbitron text-label font-bold text-ov-text">
              {wishlist.length}
            </span>
          </Link>

          <Link
            href="/library"
            aria-label={`Library, ${library.length} games`}
            className="flex items-center gap-1 text-ov-teal transition-transform duration-150 active:scale-90"
          >
            <OvIcon name="library" className="text-lg" />
            <span className="font-orbitron text-label font-bold text-ov-text">
              {library.length}
            </span>
          </Link>
        </div>

        {/* Account slot: pinned to the far right at every breakpoint. */}
        <div className="shrink-0 xl:ml-auto">
          <AccountChip />
        </div>
      </div>

      {/* Below xl: search expands into its own row, toggled by the icon above. */}
      {mobileSearchOpen && (
        <div className="animate-ov-fade-up border-t border-ov-border xl:hidden">
          <div className="mx-auto max-w-[1320px] px-4 py-3 md:px-6 lg:px-6">
            <SearchBox
              {...searchBoxCommonProps}
              innerRef={mobileSearchRef}
              inputRef={mobileInputRef}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Below xl: the primary nav is a persistent, horizontally scrollable strip
          instead of a hidden hamburger menu, so every section stays one tap away. */}
      <div className="border-t border-ov-border xl:hidden">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1320px] gap-5 overflow-x-auto px-4 py-2.5 text-xs uppercase tracking-hud [-ms-overflow-style:none] [scrollbar-width:none] md:gap-7 md:px-6 md:py-3 md:text-ui lg:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} active={isNavActive(pathname, item.href)} />
          ))}
        </nav>
      </div>
    </header>
  );
}
