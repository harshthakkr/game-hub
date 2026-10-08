import axios from "axios";

// IGDB authenticates with a Twitch app access token (client-credentials
// grant). Those tokens expire after ~60 days, so rather than pinning one in
// an env var we mint it on demand and cache it for the life of the server
// instance, refreshing shortly before Twitch says it expires.
const REFRESH_MARGIN_MS = 60 * 60 * 1000;

let cached: { token: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const { data } = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    }
  );
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - REFRESH_MARGIN_MS,
  };
  return cached.token;
}

async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt) return cached.token;
  // Concurrent requests on a cold instance share one token fetch.
  inflight ??= fetchToken().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function getIgdbHeaders() {
  return {
    "Client-ID": process.env.NEXT_PUBLIC_CLIENT_ID,
    Authorization: `Bearer ${await getAccessToken()}`,
  };
}

/// IGDB data barely changes minute to minute, but every request costs
/// ~0.8s of network. So all app queries go through this: results are kept in
/// Next's data cache (shared across requests and instances) keyed by the
/// endpoint and query, and refreshed in the background after `revalidate`
/// seconds. Returns the parsed response body.
///
/// Queries must be stable to be cacheable: anything time-based should use
/// `igdbNow()` rather than the current second.
export async function igdb<T = unknown>(
  endpoint: string,
  body: string,
  { revalidate = 3600 }: { revalidate?: number } = {}
): Promise<T> {
  const { unstable_cache } = await import("next/cache");
  const run = unstable_cache(
    async () => {
      const { data } = await axios.post<T>(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, body, {
        headers: await getIgdbHeaders(),
      });
      return data;
    },
    ["igdb", endpoint, body],
    { revalidate, tags: ["igdb"] }
  );
  return run();
}

/// "Now" in Unix seconds, rounded down to `stepSeconds`, for time-based
/// queries ("upcoming", "released") so they hit the cache. Five minutes of
/// slack is invisible at the scale of release dates and showcase schedules;
/// live/upcoming badges are still computed client-side from the real time.
export function igdbNow(stepSeconds = 300) {
  const now = Math.floor(Date.now() / 1000);
  return now - (now % stepSeconds);
}
