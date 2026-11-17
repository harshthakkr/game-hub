// Custom next/image loader: serve IGDB images straight from IGDB's CDN at the
// closest preset size instead of running them through Vercel's optimizer
// (which bills per transformation). IGDB resizes from the same originals, so
// quality matches; requesting `.webp` keeps files small.
//
// Presets (https://api-docs.igdb.com/#images): cover_* are fit-to-box
// portrait sizes; screenshot_med is a 16:9 fill; 720p/1080p are fit.

type LoaderArgs = { src: string; width: number; quality?: number };

const PORTRAIT: [number, string][] = [
  [90, "t_cover_small"],
  [264, "t_cover_big"],
  [528, "t_cover_big_2x"],
  [Infinity, "t_720p"],
];

const LANDSCAPE: [number, string][] = [
  [569, "t_screenshot_med"],
  [1280, "t_720p"],
  [Infinity, "t_1080p"],
];

const TOKEN = /\/t_[a-z0-9_]+\//;

export default function imageLoader({ src, width }: LoaderArgs) {
  if (src.includes("images.igdb.com") && TOKEN.test(src)) {
    const presets = /\/t_cover_/.test(src) ? PORTRAIT : LANDSCAPE;
    const token = presets.find(([max]) => width <= max)![1];
    return src.replace(TOKEN, `/${token}/`).replace(/\.(jpe?g|png)$/, ".webp");
  }
  // Local assets and Google avatars are already small; serve as-is. The
  // width param only satisfies next/image's loader contract.
  return src.startsWith("/") ? `${src}?w=${width}` : src;
}
