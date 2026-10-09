import { getGenreTiles } from "@/lib/genres";
import { publicJson } from "@/lib/http";

export const GET = async () => publicJson(await getGenreTiles(), 86400);
