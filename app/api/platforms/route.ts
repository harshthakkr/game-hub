import { getPlatformDirectory } from "@/lib/platforms";
import { publicJson } from "@/lib/http";

export const GET = async () => publicJson(await getPlatformDirectory(), 86400);
