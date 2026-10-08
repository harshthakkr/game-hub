"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCollection } from "@/context/CollectionContext";
import { cx } from "@/utils/cx";

/// Phones: Wishlist and Library share the Saved tab behind this switch.
export function SavedSwitcher() {
  const pathname = usePathname();
  const { wishlist, library } = useCollection();
  const items = [
    { href: "/wishlist", label: "Wishlist", count: wishlist.length },
    { href: "/library", label: "Library", count: library.length },
  ];
  return (
    <nav aria-label="Saved" className="-mb-2 grid grid-cols-2 border border-ov-border bg-ov-panel lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex h-11 items-center justify-center gap-2 text-sm font-medium",
              active
                ? "bg-ov-raised text-ov-white shadow-[inset_0_-2px_0_var(--color-ov-teal)]"
                : "text-ov-dim"
            )}
          >
            {item.label}
            <span className="font-mono text-label text-ov-dim">{item.count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
