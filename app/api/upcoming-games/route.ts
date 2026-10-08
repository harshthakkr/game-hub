import { NextRequest } from "next/server";
import { igdb, igdbNow } from "@/lib/igdb";
import { publicJson } from "@/lib/http";

export const GET = async (request: NextRequest) => {
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const games = await igdb(
    "/games",
    `fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.publisher,involved_companies.company.name; where first_release_date >= ${igdbNow(3600)} & cover != null; sort first_release_date asc; limit 40; offset ${offset};`
  );
  return publicJson(games, 3600);
};
