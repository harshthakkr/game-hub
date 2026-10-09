import { useParams } from "next/navigation";
import { useCachedJson } from "@/utils/hooks/useCachedJson";

/// One record from /api/<endpoint>/<slug of this route>, session-cached so
/// coming back renders at once (and back/forward can restore scroll).
export function useSingleData<T>(endpoint: string) {
  const { slug } = useParams();
  const { data } = useCachedJson<T>(slug ? `/api/${endpoint}/${slug}` : null);
  return { data: (data ?? {}) as T, loading: data === null };
}
