import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";

export const GET = async (request: NextRequest) => {
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const games = await igdb(
    "/games",
    `fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.publisher,involved_companies.company.name; where first_release_date >= 1735689600 & first_release_date <= 1767225599 & aggregated_rating != null & cover != null; sort aggregated_rating desc; limit 40; offset ${offset};`,
    { revalidate: 6 * 3600 }
  );
  return publicJson(games, 3600);
};
