import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { withPrices } from "@/lib/deals";
import { NextRequest, NextResponse } from "next/server";
import { GameCardProps } from "@/utils/types";
import { igdbCatalogQuery, type CatalogSort } from "@/utils/catalog";

const FIELDS =
  "fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,platforms.abbreviation,involved_companies.developer,involved_companies.publisher,involved_companies.company.name";

const PAGE_SIZE = 40;

/// Catalogue listing. `ids` fetches specific games (wishlist, library);
/// otherwise genre/platform/year/rating/sort filter the whole IGDB catalogue
/// server-side, paged by `offset`. Games we track prices for carry `price`.
export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const ids = params.get("ids");
  const offset = Math.max(0, Number(params.get("offset")) || 0);

  const headers = await getIgdbHeaders();

  try {
    if (ids) {
      const idList = ids
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0);
      if (idList.length === 0) return NextResponse.json([]);
      const gamesRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
        `${FIELDS}; where id = (${idList.join(",")}); limit ${idList.length};`,
        { headers }
      );
      return NextResponse.json(await withPrices(gamesRes.data as GameCardProps[]));
    }

    const { where, sort } = igdbCatalogQuery({
      genre: params.get("genre") ?? undefined,
      platform: params.get("platform") ?? undefined,
      year: params.get("year") ?? undefined,
      rating: params.get("rating") ?? undefined,
      sort: (params.get("sort") ?? undefined) as CatalogSort | undefined,
    });

    const [gamesRes, countRes] = await Promise.all([
      axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
        `${FIELDS}; sort ${sort}; limit ${PAGE_SIZE}; offset ${offset}; where ${where};`,
        { headers }
      ),
      // The total only matters for the first page's "N games" heading.
      offset === 0
        ? axios
            .post(`${process.env.NEXT_PUBLIC_BASE_URL}/games/count`, `where ${where};`, { headers })
            .catch(() => null)
        : null,
    ]);
    const response = NextResponse.json(await withPrices(gamesRes.data as GameCardProps[]));
    const total = countRes?.data?.count;
    if (typeof total === "number") response.headers.set("X-Total-Count", String(total));
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
};
