export function coverUrl(cover?: { url: string }) {
  if (!cover?.url) return null;
  return `https:${cover.url.replace("t_thumb", "t_1080p")}`;
}

export function abbrev(name: string) {
  return name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function platformAbbr(name: string) {
  const map: Record<string, string> = {
    "Nintendo Switch 2": "NS2",
    "PlayStation 5": "PS5",
    "Xbox Series X|S": "XSX",
    "Meta Quest 3": "MQ3",
    "PlayStation VR2": "PSVR",
    "Steam Deck": "SD",
    "Nintendo Switch": "NSW",
    "PlayStation 4": "PS4",
    "Xbox One": "XB1",
    "PC (Microsoft Windows)": "PC",
    macOS: "MAC",
    iOS: "IOS",
    Android: "AND",
    "Nintendo 3DS": "3DS",
    "PlayStation Vita": "VITA",
    Playdate: "PDT",
  };
  return map[name] || abbrev(name);
}

const genreGradients: Record<string, string> = {
  "Role-playing (RPG)": "from-violet-600 to-violet-950",
  Shooter: "from-red-600 to-red-950",
  Fighting: "from-rose-500 to-rose-950",
  Adventure: "from-teal-600 to-teal-950",
  Strategy: "from-sky-500 to-sky-950",
  Racing: "from-amber-500 to-amber-900",
  Horror: "from-slate-500 to-slate-800",
  Platform: "from-purple-500 to-purple-950",
  Simulator: "from-cyan-400 to-cyan-950",
  Sport: "from-lime-500 to-lime-900",
  Indie: "from-pink-500 to-pink-950",
  Puzzle: "from-teal-500 to-teal-950",
  MOBA: "from-orange-500 to-orange-900",
  Roguelite: "from-violet-500 to-violet-950",
  "Card & Board": "from-red-500 to-red-950",
  "Visual Novel": "from-fuchsia-500 to-fuchsia-950",
};

export function genreGradient(name: string) {
  return genreGradients[name] || "from-teal-600 to-slate-900";
}

export function formatYear(date?: number) {
  if (!date) return "";
  return new Date(date * 1000).getFullYear().toString();
}

export function formatRating(rating?: number) {
  if (!rating) return "—";
  return Math.round(rating).toString();
}

// Games IGDB users have marked "hyped" ahead of release cluster heavily at 0
// (~65% of the catalogue); 25+ sits in roughly the top 10%, which is a
// reasonable bar for an actual "HOT" signal rather than a default label.
const HOT_HYPES_THRESHOLD = 25;

export function gameTag(genres?: { name: string }[], hypes?: number) {
  const primary = genres?.[0]?.name;
  const name = primary?.toLowerCase() || "";
  if (name.includes("indie")) return "INDIE";
  if (name.includes("rpg")) return "RPG";
  if (name.includes("horror")) return "HORROR";
  if (name.includes("fighting")) return "FIGHTING";
  if ((hypes || 0) >= HOT_HYPES_THRESHOLD) return "HOT";
  return primary ? primary.toUpperCase() : null;
}

export function developerName(
  companies?: {
    developer: boolean;
    publisher: boolean;
    company: { name: string };
  }[]
) {
  return (
    companies?.find((c) => c.developer)?.company.name ||
    companies?.[0]?.company.name ||
    ""
  );
}

export function formatEventDate(timestamp?: number) {
  if (!timestamp) return "TBD";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function eventStatus(start?: number, end?: number) {
  const now = Date.now() / 1000;
  if (start && end && now >= start && now <= end) {
    return { label: "LIVE", filter: "live" as const };
  }
  if (start && start > now) {
    const days = Math.ceil((start - now) / 86400);
    if (days <= 31) {
      return {
        label: days <= 1 ? "LIVE SOON" : `${days} DAYS`,
        filter: "upcoming" as const,
      };
    }
    const months = Math.ceil(days / 30);
    return {
      label: months === 1 ? "1 MONTH" : `${months} MONTHS`,
      filter: "month" as const,
    };
  }
  return { label: "PAST", filter: "month" as const };
}

/// Full date + time, rendered in the reader's own local time (no GMT/UTC
/// offset label — the browser already converts the timestamp silently).
export function formatEventDateTime(timestamp?: number) {
  if (!timestamp) return "TBD";
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function isThisCalendarMonth(timestamp?: number) {
  if (!timestamp) return false;
  const d = new Date(timestamp * 1000);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

export function isUpcoming(timestamp?: number) {
  if (!timestamp) return false;
  return timestamp * 1000 > Date.now();
}

/// Google Calendar's "add event" template link. This deliberately avoids the
/// Calendar API: no extra OAuth scopes, and it works for signed-out visitors.
export function googleCalendarUrl({
  title,
  start,
  end,
  details,
  location,
}: {
  title: string;
  start: number;
  end?: number;
  details?: string;
  location?: string;
}) {
  const stamp = (seconds: number) =>
    new Date(seconds * 1000).toISOString().replace(/[-:]|\.\d{3}/g, "");
  // Default to a one-hour block when the source has no end time.
  const finish = end && end > start ? end : start + 3600;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(finish)}`,
  });
  if (details) params.set("details", details.slice(0, 900));
  if (location) params.set("location", location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/// IGDB image at a given size preset (t_1080p, t_screenshot_big, ...).
export function igdbImage(url: string, size: string) {
  return `https:${url.replace("t_thumb", size)}`;
}

/// Widest landscape image from a list, for heroes and banners. Portrait box
/// art upscaled into a wide hero looks blurry, so callers fall back to a
/// designed treatment rather than the cover when this returns null.
export function landscapeArt(list?: { url: string; width?: number; height?: number }[]) {
  const wide = (list ?? []).filter((i) => !i.width || !i.height || i.width >= i.height);
  wide.sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return wide[0] ? igdbImage(wide[0].url, "t_1080p") : null;
}

function duration(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.max(1, Math.floor((seconds % 3600) / 60));
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/// Event state for badges and countdowns, in sentence case.
export function eventTiming(start?: number, end?: number, now = Date.now() / 1000) {
  if (!start) {
    return { state: "tba" as const, badge: "Date TBA", countdownLabel: "STARTS", countdown: "TBA" };
  }
  const finish = end && end > start ? end : start + 3600;
  if (now >= start && now <= finish) {
    return { state: "live" as const, badge: "Live now", countdownLabel: "ENDS IN", countdown: duration(finish - now) };
  }
  if (now > finish) {
    return { state: "past" as const, badge: "Ended", countdownLabel: "ENDED", countdown: formatEventDate(finish) };
  }
  const days = Math.floor((start - now) / 86400);
  const sameDay = new Date(start * 1000).toDateString() === new Date(now * 1000).toDateString();
  return {
    state: "upcoming" as const,
    badge: sameDay ? "Today" : days <= 1 ? "Tomorrow" : `In ${days} days`,
    countdownLabel: "STARTS IN",
    countdown: duration(start - now),
  };
}
