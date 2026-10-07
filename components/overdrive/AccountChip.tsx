"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "./reviews/Avatar";
import { displayName } from "@/utils/reviews";
import { Button, Menu, MenuHeader, MenuItem } from "@/components/ui";

/// Top-bar account slot: the log-in CTA when signed out; when signed in, the
/// avatar opens a menu holding sign-out.
export function AccountChip() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="size-[30px] animate-ov-pulse bg-ov-raised" />;
  }

  if (!session?.user) {
    return (
      <Button asChild variant="primary" size="sm" chamfer>
        <Link href={`/register?mode=login&callbackUrl=${encodeURIComponent(pathname || "/games")}`}>
          LOG IN
        </Link>
      </Button>
    );
  }

  const user = {
    username: session.user.username ?? null,
    name: session.user.name ?? null,
    image: session.user.image ?? null,
  };
  const handle = displayName(user);

  return (
    <Menu
      trigger={
        <button
          type="button"
          aria-label={`Account menu for ${handle}`}
          className="flex items-center gap-2.5 transition-opacity duration-150 hover:opacity-80 data-[state=open]:opacity-80"
        >
          <Avatar author={user} size={30} />
          <span className="hidden max-w-[110px] truncate text-xs text-ov-text lg:inline">
            {handle}
          </span>
        </button>
      }
    >
      <MenuHeader>
        <div className="truncate text-xs text-ov-white">{handle}</div>
        {session.user.email && (
          <div className="mt-0.5 truncate text-micro text-ov-muted">{session.user.email}</div>
        )}
      </MenuHeader>
      <MenuItem tone="danger" onSelect={() => signOut({ callbackUrl: "/games" })}>
        SIGN OUT
      </MenuItem>
    </Menu>
  );
}
