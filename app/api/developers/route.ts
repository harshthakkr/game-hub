import { NextRequest } from "next/server";
import { getStudioLeaderboard, searchStudios } from "@/lib/developers";
import { publicJson } from "@/lib/http";

/// No query: the studio leaderboard. `?q=`: studios whose name contains it.
export const GET = async (request: NextRequest) => {
  const q = request.nextUrl.searchParams.get("q");
  if (q !== null) return publicJson(await searchStudios(q), 3600);
  return publicJson(await getStudioLeaderboard(), 86400);
};
