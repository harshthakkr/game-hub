import { getDiscover } from "@/lib/discover";
import { DiscoverView } from "@/components/overdrive/DiscoverView";

// IGDB data changes slowly; re-render Discover at most hourly. Each re-render
// is a billed ISR write, and crawlers keep it warm around the clock.
export const revalidate = 3600;

export default async function DiscoverPage() {
  const initial = await getDiscover().catch(() => null);
  return <DiscoverView initial={initial} />;
}
