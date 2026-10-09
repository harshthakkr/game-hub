"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Avatar } from "./reviews/Avatar";
import { displayName } from "@/utils/reviews";
import { Button, Menu, MenuHeader, MenuItem, MenuSeparator } from "@/components/ui";
import { usePagePath } from "@/utils/hooks/usePagePath";

/// Top-bar account slot: "Sign in" when signed out; when signed in, the
/// avatar opens a menu with who's signed in and sign-out. (Wishlist and
/// library aren't repeated here: the top bar's icons and the phone tab bar
/// already link to them.)
export function AccountChip() {
  const { data: session, status } = useSession();
  const pathname = usePagePath();

  if (status === "loading") {
    return <div className="size-[34px] animate-ov-pulse bg-ov-raised" />;
  }

  if (!session?.user) {
    return (
      <Button asChild variant="primary" size="sm" chamfer>
        <Link href={`/register?mode=login&callbackUrl=${encodeURIComponent(pathname || "/")}`}>
          Sign in
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
          className="ov-chamfer ov-chamfer-sm transition-opacity duration-150 hover:opacity-85 data-[state=open]:opacity-85"
        >
          <Avatar author={user} size={34} />
        </button>
      }
    >
      <MenuHeader>
        <div className="truncate text-body font-semibold text-ov-white">{handle}</div>
        {session.user.email && (
          <div className="truncate text-ui text-ov-muted">{session.user.email}</div>
        )}
      </MenuHeader>
      <MenuSeparator />
      <MenuItem tone="danger" onSelect={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </MenuItem>
    </Menu>
  );
}
