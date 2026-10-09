import { NextResponse } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";
import { bestPrices } from "@/lib/deals";

const LIMIT = 12;

/// Tracked games currently on sale, deepest discount first. "Tracked" means
/// someone viewed or collected the game recently, so this is a window onto
/// what players here care about, not every sale on either store.
export const GET = async () => {
  try {
    const prices = await bestPrices();
    const onSale = [...prices.entries()]
      .filter(([, p]) => p.discountPercent > 0)
      .sort(([, a], [, b]) => b.discountPercent - a.discountPercent)
      .slice(0, LIMIT);
    if (onSale.length === 0) return publicJson([], 600);

    const ids = onSale.map(([id]) => id).sort((a, b) => a - b);
    const data = await igdb<{ id: number }[]>(
      "/games",
      `fields id,name,slug,cover.url,first_release_date,genres.name; where id = (${ids.join(",")}); limit ${LIMIT};`
    );
    const byId = new Map(data.map((g) => [g.id, g]));
    // Prices are checked every 3 hours at most; the CDN copy refreshes every 10 min.
    return publicJson(
      onSale.flatMap(([id, price]) => (byId.has(id) ? [{ ...byId.get(id), price }] : [])),
      600
    );
  } catch {
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
};
