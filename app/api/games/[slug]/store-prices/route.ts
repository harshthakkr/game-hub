import { NextRequest, NextResponse, userAgent } from "next/server";
import { getGame, getStorePrices } from "@/lib/games";
import { publicJson, safeSlug } from "@/lib/http";

/// Current price on each store the game is listed on, for "Where to buy".
/// Fetched by the browser rather than rendered into the cached page, so
/// crawlers (which get nothing here) never wake the database. The bot answer
/// isn't cached, so the CDN never serves it to people.
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  if (userAgent(request).isBot) {
    return NextResponse.json({ stores: null }, { headers: { "Cache-Control": "no-store" } });
  }
  const game = await getGame(safeSlug((await params).slug));
  if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
  // Prices are checked every 6 hours at most; a 5-minute shared copy is plenty.
  return publicJson({ stores: await getStorePrices(game) }, 300);
};
