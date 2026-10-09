import { NextResponse } from "next/server";
import { getDiscover } from "@/lib/discover";

export const GET = async () => {
  try {
    return NextResponse.json(await getDiscover());
  } catch {
    return NextResponse.json({ error: "Failed to load Discover" }, { status: 500 });
  }
};
