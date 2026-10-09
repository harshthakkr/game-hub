import { NextRequest } from "next/server";
import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";

export const GET = async (request: NextRequest) => {
  const offset = Math.max(0, Number(request.nextUrl.searchParams.get("offset")) || 0);
  const platforms = await igdb(
    "/platforms",
    `fields name,slug,platform_family.name; sort generation desc; limit 40; offset ${offset};`,
    { revalidate: 86400 }
  );
  return publicJson(platforms, 86400);
};
