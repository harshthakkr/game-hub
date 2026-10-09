"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type CollectionKey = "wishlist" | "library";

export type Shelf = "PLAYING" | "BACKLOG" | "FINISHED";

export const SHELVES: { value: Shelf; label: string; detail: string; marker: string }[] = [
  { value: "PLAYING", label: "Playing", detail: "In progress right now", marker: "bg-ov-teal" },
  { value: "BACKLOG", label: "Backlog", detail: "Own it, not started yet", marker: "bg-ov-muted" },
  { value: "FINISHED", label: "Finished", detail: "Rolled the credits", marker: "bg-ov-white" },
];

type CollectionState = Record<CollectionKey, number[]> & {
  shelves: Record<number, Shelf>;
};

const EMPTY: CollectionState = { wishlist: [], library: [], shelves: {} };

type CollectionContextValue = {
  wishlist: number[];
  library: number[];
  ready: boolean;
  signedIn: boolean;
  toggleWish: (id: number) => void;
  toggleLibrary: (id: number) => void;
  /// Puts a game on a shelf (adding it to the library if needed), or removes
  /// it from the library with null.
  setShelf: (id: number, shelf: Shelf | null) => void;
  shelfOf: (id: number) => Shelf | null;
  isWished: (id: number) => boolean;
  isInLibrary: (id: number) => boolean;
};

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function loginHref(pathname: string | null) {
  return `/register?mode=login&callbackUrl=${encodeURIComponent(pathname || "/")}`;
}

/// Wishlist and library live on the signed-in user's account. Signed-out
/// visitors see empty collections and are sent to log in when they try to
/// add something.
export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [collection, setCollection] = useState<CollectionState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Collections used to be kept in localStorage, unattached to any account.
    try {
      localStorage.removeItem("ov-wishlist");
      localStorage.removeItem("ov-library");
    } catch {}
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    setCollection(EMPTY);
    if (!userId) {
      setReady(true);
      return;
    }
    setReady(false);
    let cancelled = false;
    axios
      .get<CollectionState>("/api/collection")
      .then((res) => {
        if (!cancelled) setCollection({ ...EMPTY, ...res.data });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [status, userId]);

  // Membership is set explicitly (not toggled) so an Undo can restore the
  // previous state without reading a stale closure.
  const setMembership = useCallback(
    (key: CollectionKey, id: number, saved: boolean, withUndo = true) => {
      const apply = (add: boolean) =>
        setCollection((prev) => ({
          ...prev,
          [key]: add
            ? [id, ...prev[key].filter((x) => x !== id)]
            : prev[key].filter((x) => x !== id),
        }));

      apply(saved);
      axios
        .post("/api/collection", { kind: key, gameId: id, saved })
        .then(() => {
          if (!withUndo) return;
          const where = key === "wishlist" ? "wishlist" : "library";
          toast({
            message: saved ? `Added to ${where}` : `Removed from ${where}`,
            action: { label: "Undo", onClick: () => setMembership(key, id, !saved, false) },
          });
        })
        .catch(() => {
          apply(!saved);
          toast({ message: "Couldn't save that change. Try again." });
        });
    },
    [toast]
  );

  const toggle = useCallback(
    (key: CollectionKey, id: number) => {
      if (!userId) {
        router.push(loginHref(pathname));
        return;
      }
      setMembership(key, id, !collection[key].includes(id));
    },
    [userId, collection, router, pathname, setMembership]
  );

  const setShelf = useCallback(
    (id: number, shelf: Shelf | null) => {
      if (!userId) {
        router.push(loginHref(pathname));
        return;
      }
      const before = collection;
      setCollection((prev) => {
        const shelves = { ...prev.shelves };
        if (shelf) shelves[id] = shelf;
        else delete shelves[id];
        const library = prev.library.filter((x) => x !== id);
        return { ...prev, shelves, library: shelf ? [id, ...library] : library };
      });
      axios
        .post("/api/collection", { kind: "library", gameId: id, saved: !!shelf, status: shelf ?? undefined })
        .then(() =>
          toast({
            message: shelf
              ? `Saved to ${SHELVES.find((x) => x.value === shelf)!.label}`
              : "Removed from library",
          })
        )
        .catch(() => {
          setCollection(before);
          toast({ message: "Couldn't save that change. Try again." });
        });
    },
    [userId, collection, router, pathname, toast]
  );

  const toggleWish = useCallback((id: number) => toggle("wishlist", id), [toggle]);
  const toggleLibrary = useCallback((id: number) => toggle("library", id), [toggle]);

  const value = useMemo(
    () => ({
      wishlist: collection.wishlist,
      library: collection.library,
      ready,
      signedIn: !!userId,
      toggleWish,
      toggleLibrary,
      setShelf,
      shelfOf: (id: number) =>
        collection.library.includes(id) ? (collection.shelves[id] ?? "BACKLOG") : null,
      isWished: (id: number) => collection.wishlist.includes(id),
      isInLibrary: (id: number) => collection.library.includes(id),
    }),
    [collection, ready, userId, toggleWish, toggleLibrary, setShelf]
  );

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error("useCollection must be used within CollectionProvider");
  return ctx;
}
