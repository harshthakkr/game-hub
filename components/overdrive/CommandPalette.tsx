"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Command } from "cmdk";
import { OvIcon, type IconName } from "./OvIcon";
import { coverUrl, formatYear } from "@/utils/overdrive";
import { GENRES } from "@/utils/catalog";
import type { GameCardProps } from "@/utils/types";

type Recent = Pick<GameCardProps, "id" | "name" | "slug" | "cover">;
const RECENT_KEY = "gh-recent-games";

/// Last few games opened from search, kept in this browser only.
function readRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushRecent(game: Recent) {
  try {
    const next = [game, ...readRecent().filter((g) => g.id !== game.id)].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): recents are a convenience, skip them.
  }
}

export const NAV_PAGES: { label: string; href: string; icon: IconName }[] = [
  { label: "Discover", href: "/", icon: "grid" },
  { label: "Catalogue", href: "/games", icon: "list" },
  { label: "Events", href: "/events", icon: "clock" },
  { label: "Platforms", href: "/platforms", icon: "grid" },
  { label: "Genres", href: "/genres", icon: "grid" },
  { label: "Developers", href: "/developers", icon: "user" },
  { label: "Concierge", href: "/ai", icon: "sparkles" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Library", href: "/library", icon: "library" },
];

const PaletteContext = createContext<{ open: () => void } | null>(null);

export function useCommandPalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  return ctx;
}

/// Global ⌘K / Ctrl+K palette: search games, jump to a page, or hand the
/// query to the Concierge. Mounted once; anything can open it via
/// useCommandPalette().
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open: () => setOpen(true) }), []);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </PaletteContext.Provider>
  );
}

function useGameSearch(query: string) {
  const [results, setResults] = useState<GameCardProps[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      axios
        .get<GameCardProps[]>("/api/search", {
          params: { q, limit: 8 },
          signal: controller.signal,
        })
        .then((res) => setResults(res.data.filter((g) => g.cover)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, loading };
}

const GROUP_HEADING =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-hud [&_[cmdk-group-heading]]:text-micro [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-label [&_[cmdk-group-heading]]:text-ov-muted";

const ITEM =
  "flex min-h-[52px] cursor-pointer items-center gap-3 px-3 py-2 text-body lg:min-h-0 lg:text-sm text-ov-text data-[selected=true]:bg-ov-raised data-[selected=true]:text-ov-white data-[selected=true]:shadow-[inset_2px_0_0_var(--color-ov-teal)]";

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { results, loading } = useGameSearch(query);
  const [recent, setRecent] = useState<Recent[]>([]);
  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      router.push(href);
    },
    [onOpenChange, router]
  );

  const trimmed = query.trim();
  const pages = NAV_PAGES.filter((p) =>
    p.label.toLowerCase().includes(trimmed.toLowerCase())
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search and navigation"
      // Results come pre-ranked from IGDB; filtering is done above.
      shouldFilter={false}
      overlayClassName="fixed inset-0 z-[110] bg-[rgb(2_3_8/0.72)] backdrop-blur-[4px] data-[state=open]:animate-ov-fade-up"
      // Phones: a full-screen search page. Desktop: a centred palette.
      contentClassName="fixed inset-0 z-[110] flex flex-col bg-ov-bg data-[state=open]:animate-ov-fade-up lg:inset-auto lg:top-[12vh] lg:left-1/2 lg:max-h-[70vh] lg:w-[min(640px,calc(100%-32px))] lg:-translate-x-1/2 lg:border lg:border-ov-border-strong lg:bg-ov-field lg:shadow-ov-pop lg:data-[state=open]:animate-ov-pop"
    >
      <div className="flex shrink-0 items-center gap-1.5 border-b border-ov-border py-1.5 pr-1.5 pl-4 lg:h-14 lg:gap-3 lg:p-0 lg:px-4">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 border border-ov-border-strong bg-ov-field px-3 lg:h-full lg:border-0 lg:bg-transparent lg:px-0">
          <OvIcon name="search" className="text-lg text-ov-muted" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Games, pages or ask the Concierge"
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-ov-white outline-none placeholder:text-ov-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex h-11 items-center px-2.5 text-body text-ov-teal lg:hidden"
        >
          Cancel
        </button>
        <kbd className="hidden border border-ov-border-strong px-1.5 py-0.5 font-hud text-micro text-ov-dim lg:block">
          ESC
        </kbd>
      </div>

      <Command.List className={`min-h-0 flex-1 overflow-y-auto p-1.5 ${GROUP_HEADING}`}>
        {trimmed.length < 2 && recent.length > 0 && (
          <Command.Group heading="Recent">
            {recent.map((game) => {
              const cover = coverUrl(game.cover);
              return (
                <Command.Item
                  key={game.id}
                  value={`recent-${game.id}`}
                  onSelect={() => go(`/games/${game.slug}`)}
                  className={ITEM}
                >
                  {cover ? (
                    <Image src={cover} alt="" width={28} height={37} className="h-[37px] w-7 shrink-0 object-cover" />
                  ) : (
                    <span className="h-[37px] w-7 shrink-0 bg-ov-raised" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">{game.name}</span>
                  <span className="font-hud text-micro text-ov-dim">GAME</span>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}
        {loading && results.length === 0 && (
          <Command.Loading>
            <div className="px-3 py-4 text-sm text-ov-muted">Searching…</div>
          </Command.Loading>
        )}

        {results.length > 0 && (
          <Command.Group heading="Games">
            {results.map((game) => {
              const cover = coverUrl(game.cover);
              return (
                <Command.Item
                  key={game.id}
                  value={`game-${game.id}`}
                  onSelect={() => {
                    pushRecent({ id: game.id, name: game.name, slug: game.slug, cover: game.cover });
                    go(`/games/${game.slug}`);
                  }}
                  className={ITEM}
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      width={28}
                      height={37}
                      className="h-[37px] w-7 shrink-0 object-cover"
                    />
                  ) : (
                    <span className="h-[37px] w-7 shrink-0 bg-ov-raised" />
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate font-medium">{game.name}</span>
                    <span className="text-label text-ov-muted">
                      {[formatYear(game.first_release_date), game.genres?.[0]?.name]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="font-hud text-micro text-ov-dim">GAME</span>
                </Command.Item>
              );
            })}
          </Command.Group>
        )}

        {trimmed.length >= 2 && (
          <Command.Group heading="Concierge">
            <Command.Item
              value="ask-concierge"
              onSelect={() => go(`/ai?q=${encodeURIComponent(trimmed)}`)}
              className={ITEM}
            >
              <OvIcon name="sparkles" className="text-base text-ov-teal" />
              <span className="min-w-0 flex-1 truncate">
                Ask the Concierge: <span className="text-ov-white">“{trimmed}”</span>
              </span>
              <span className="font-hud text-micro text-ov-dim">ASK</span>
            </Command.Item>
          </Command.Group>
        )}

        {pages.length > 0 && (
          <Command.Group heading="Pages">
            {pages.map((page) => (
              <Command.Item
                key={page.href}
                value={`page-${page.href}`}
                onSelect={() => go(page.href)}
                className={ITEM}
              >
                <OvIcon name={page.icon} className="text-base text-ov-muted" />
                <span className="flex-1">{page.label}</span>
                <span className="font-hud text-micro text-ov-dim">PAGE</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {trimmed.length < 2 && (
          <Command.Group heading="Genres">
            {GENRES.slice(0, 6).map((g) => (
              <Command.Item
                key={g.value}
                value={`genre-${g.value}`}
                onSelect={() => go(`/games?genre=${g.value}`)}
                className={ITEM}
              >
                <OvIcon name="list" className="text-base text-ov-muted" />
                <span className="flex-1">{g.label}</span>
                <span className="font-hud text-micro text-ov-dim">GENRE</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {!loading && trimmed.length >= 2 && results.length === 0 && pages.length === 0 && (
          <Command.Empty className="px-3 py-6 text-center text-sm text-ov-muted">
            No games match “{trimmed}”.
          </Command.Empty>
        )}
      </Command.List>

      <div className="hidden shrink-0 gap-4 border-t border-ov-border px-4 py-2.5 text-label text-ov-muted lg:flex">
        <span>↑↓ navigate</span>
        <span>↵ open</span>
        <span>esc close</span>
      </div>
    </Command.Dialog>
  );
}
