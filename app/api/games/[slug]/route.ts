import { NextRequest, NextResponse } from "next/server";
import { getGame } from "@/lib/games";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  return NextResponse.json(await getGame(slug));
};
