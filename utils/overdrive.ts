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

/// Short badge code for a platform (≤5 characters): a curated code for the
/// well-known systems, else IGDB's own abbreviation when it's badge-sized
/// (IGDB's range from good, "PSP", to unusable, "Genesis/MegaDrive"), else
/// initials as a last resort.
export function platformAbbr(name: string, igdbAbbreviation?: string | null) {
  const map: Record<string, string> = {
    "Nintendo Switch 2": "NS2",
    "Nintendo Switch": "NSW",
    "PlayStation 5": "PS5",
    "PlayStation 4": "PS4",
    "PlayStation 3": "PS3",
    "PlayStation 2": "PS2",
    PlayStation: "PS1",
    "PlayStation VR2": "PSVR2",
    "PlayStation VR": "PSVR",
    "PlayStation Vita": "VITA",
    "PlayStation Portable": "PSP",
    "Xbox Series X|S": "XSX",
    "Xbox One": "XB1",
    "Xbox 360": "X360",
    Xbox: "XBOX",
    "Nintendo 3DS": "3DS",
    "New Nintendo 3DS": "N3DS",
    "Nintendo DS": "NDS",
    "Nintendo DSi": "DSI",
    "Wii U": "WIIU",
    Wii: "WII",
    "Nintendo GameCube": "GC",
    "Nintendo 64": "N64",
    "Game Boy Advance": "GBA",
    "Game Boy Color": "GBC",
    "Game Boy": "GB",
    "Meta Quest 3": "MQ3",
    "Meta Quest 2": "MQ2",
    "Oculus Quest": "QST",
    "Oculus Rift": "RIFT",
    "Oculus VR": "OVR",
    SteamVR: "SVR",
    "Steam Deck": "DECK",
    "PC (Microsoft Windows)": "PC",
    Mac: "MAC",
    macOS: "MAC",
    Linux: "LINUX",
    iOS: "IOS",
    Android: "AND",
    "Web browser": "WEB",
    "Sega Mega Drive/Genesis": "MD",
    "Sega Game Gear": "GG",
    "Sega Saturn": "SAT",
    "Sega Master System/Mark III": "SMS",
    "Sega CD": "SCD",
    "Sega 32X": "32X",
    "SG-1000": "SG1K",
    "Atari 2600": "2600",
    "Atari 5200": "5200",
    "Atari 7800": "7800",
    "Atari ST/STE": "ST",
    "Atari 8-bit": "8-BIT",
    "Atari Jaguar": "JAG",
    "Atari Jaguar CD": "JAGCD",
    "Atari Lynx": "LYNX",
    Playdate: "PDT",
  };
  if (map[name]) return map[name];
  if (igdbAbbreviation && igdbAbbreviation.length <= 5 && !/\s/.test(igdbAbbreviation))
    return igdbAbbreviation.toUpperCase();
  return abbrev(name);
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

type Art = { url: string; width?: number; height?: number };

/// Best landscape image for heroes and banners, searching the lists in order
/// (e.g. artworks, then screenshots): first the largest image shaped like key
/// art (roughly 4:3 to 21:9) in any list, else any landscape image. Ultra-wide
/// strips (logo banners) crop to almost nothing in a hero, and portrait box
/// art upscaled into one looks blurry, so callers fall back to a designed
/// treatment rather than the cover when this returns null.
export function landscapeArt(...lists: (Art[] | undefined)[]) {
  const ratio = (i: Art) => (i.width && i.height ? i.width / i.height : 16 / 9);
  const largest = (items: Art[]) => [...items].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  for (const list of lists) {
    const keyArt = (list ?? []).filter((i) => ratio(i) >= 1.3 && ratio(i) <= 2.4);
    if (keyArt.length) return igdbImage(largest(keyArt).url, "t_1080p");
  }
  const wide = lists.flatMap((l) => l ?? []).filter((i) => ratio(i) >= 1);
  return wide.length ? igdbImage(largest(wide).url, "t_1080p") : null;
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
