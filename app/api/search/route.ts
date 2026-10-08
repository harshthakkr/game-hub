import axios from "axios";
import { getIgdbHeaders } from "@/lib/igdb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    // Strip quotes and backslashes: the term is interpolated into an IGDB
    // Apicalypse string literal, and these would let it escape the query.
    const search = (request.nextUrl.searchParams.get("q") || "").replace(/["\\]/g, " ").trim();
    const limit = Math.min(40, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 40));
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/games`,
      `fields id,name,slug,cover.url,aggregated_rating,first_release_date,genres.name,hypes,involved_companies.developer,involved_companies.publisher,involved_companies.company.name; search "${search}"; limit ${limit};`,
      {
        headers: await getIgdbHeaders(),
      }
    );
    return NextResponse.json(res.data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search games" },
      { status: 500 }
    );
  }
};
