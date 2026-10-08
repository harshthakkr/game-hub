import { igdb } from "@/lib/igdb";
import { publicJson } from "@/lib/http";

export const GET = async () => {
  const genres = await igdb("/genres", "fields name,slug; limit 40;", { revalidate: 86400 });
  return publicJson(genres, 86400);
};
