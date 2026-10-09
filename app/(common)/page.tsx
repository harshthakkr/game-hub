import { getDiscover } from "@/lib/discover";
import { DiscoverView } from "@/components/overdrive/DiscoverView";

// IGDB data changes slowly; re-render Discover at most every 10 minutes.
export const revalidate = 600;

export default async function DiscoverPage() {
  const initial = await getDiscover().catch(() => null);
  return <DiscoverView initial={initial} />;
}
