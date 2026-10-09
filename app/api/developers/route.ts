import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";

export const GET = async (request: NextRequest) => {
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const developers = await igdb(
    "/companies",
    `fields name,slug; sort start_date desc; limit 40; offset ${offset};`,
    { revalidate: 86400 }
  );
  return publicJson(developers, 86400);
};
