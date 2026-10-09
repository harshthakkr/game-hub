import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { CollectionKind, LibraryStatus } from "@/app/generated/prisma";

const KINDS: Record<string, CollectionKind> = {
  wishlist: "WISHLIST",
  library: "LIBRARY",
};

const STATUSES: LibraryStatus[] = ["PLAYING", "BACKLOG", "FINISHED"];

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const items = await prisma.collectionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { kind: true, gameId: true, status: true },
  });
  const library = items.filter((i) => i.kind === "LIBRARY");

  return NextResponse.json({
    wishlist: items.filter((i) => i.kind === "WISHLIST").map((i) => i.gameId),
    library: library.map((i) => i.gameId),
    // Shelf per library game; games saved before shelves existed read as backlog.
    shelves: Object.fromEntries(library.map((i) => [i.gameId, i.status ?? "BACKLOG"])),
  });
};

/// Sets (rather than toggles) membership so retries and double-clicks are
/// idempotent: { kind: "wishlist" | "library", gameId, saved: boolean }.
/// Library saves may carry a shelf, { status: "PLAYING" | "BACKLOG" |
/// "FINISHED" }, which moves an already-saved game too.
export const POST = async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  const kind = KINDS[body?.kind];
  const gameId = Number(body?.gameId);
  const status: LibraryStatus | undefined =
    kind === "LIBRARY" && STATUSES.includes(body?.status) ? body.status : undefined;
  if (!kind || !Number.isInteger(gameId) || gameId <= 0 || typeof body?.saved !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.saved) {
    await prisma.collectionItem.upsert({
      where: { userId_kind_gameId: { userId, kind, gameId } },
      create: {
        userId,
        kind,
        gameId,
        status: kind === "LIBRARY" ? (status ?? "BACKLOG") : null,
      },
      update: status ? { status } : {},
    });
  } else {
    await prisma.collectionItem.deleteMany({ where: { userId, kind, gameId } });
  }

  return NextResponse.json({ ok: true });
};
