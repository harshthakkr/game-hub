import { NextRequest } from "next/server";
import { getGame } from "@/lib/games";
import { publicJson } from "@/lib/http";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  return publicJson(await getGame(slug), 300);
};
