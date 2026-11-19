import { NextRequest } from "next/server";
import { getGameWithPrices } from "@/lib/games";
import { publicJson } from "@/lib/http";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;
  return publicJson(await getGameWithPrices(slug), 300);
};
