// Custom next/image loader: serve IGDB images straight from IGDB's CDN at the
// closest preset size instead of running them through Vercel's optimizer
// (which bills per transformation). IGDB resizes from the same originals, so
// quality matches; requesting `.webp` keeps files small.
//
// Only "fit" presets are used: they scale the whole image into a box without
// cropping, so they work for covers and key art alike (the src's own token,
// e.g. t_1080p on a cover, says nothing about its shape). The crop presets
// (screenshot_*, thumb) would cut a portrait cover down to a 16:9 strip.
// Width each preset delivers: the box width for landscape images, a little
// less for 3:4 covers (720p gives a cover 540px, 1080p 811px).

type LoaderArgs = { src: string; width: number; quality?: number };

const PRESETS: [number, string][] = [
  [90, "t_cover_small"],
  [180, "t_cover_small_2x"],
  [264, "t_cover_big"],
  [528, "t_cover_big_2x"],
  [1280, "t_720p"],
  [Infinity, "t_1080p"],
];

const TOKEN = /\/t_[a-z0-9_]+\//;

export default function imageLoader({ src, width }: LoaderArgs) {
  if (src.includes("images.igdb.com") && TOKEN.test(src)) {
    const token = PRESETS.find(([max]) => width <= max)![1];
    return src.replace(TOKEN, `/${token}/`).replace(/\.(jpe?g|png)$/, ".webp");
  }
  // Local assets and Google avatars are already small; serve as-is. The
  // width param only satisfies next/image's loader contract.
  return src.startsWith("/") ? `${src}?w=${width}` : src;
}
