import sharp from "sharp";

/// Per-game accent: the cover's most vivid hue, normalised so it always
/// reads on the near-black UI. Used only for ambient light around the hero
/// (glow, cover shadow); interactive teal stays the brand colour.
///
/// Average colour would be mud for most covers, so this buckets hues of a
/// tiny thumbnail, weights each pixel by saturation × brightness, and takes
/// the heaviest bucket. Greyscale covers return null (callers fall back to
/// teal).
export async function coverAccent(coverUrl: string): Promise<string | null> {
  try {
    const src = coverUrl.startsWith("//") ? `https:${coverUrl}` : coverUrl;
    const res = await fetch(src.replace(/\/t_[a-z0-9_]+\//, "/t_cover_small/"), {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) return null;
    const { data } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(24, 32, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const BUCKETS = 24;
    const weight = new Array<number>(BUCKETS).fill(0);
    const hueSum = new Array<number>(BUCKETS).fill(0);
    let total = 0;
    for (let i = 0; i < data.length; i += 3) {
      const [h, s, v] = hsv(data[i], data[i + 1], data[i + 2]);
      const w = s * s * v; // favour saturated, lit pixels
      total += w;
      if (s < 0.25 || v < 0.2) continue;
      const b = Math.floor((h / 360) * BUCKETS) % BUCKETS;
      weight[b] += w;
      hueSum[b] += h * w;
    }
    const best = weight.indexOf(Math.max(...weight));
    if (weight[best] === 0 || weight[best] < total * 0.08) return null;
    const hue = Math.round(hueSum[best] / weight[best]);
    // Fixed lightness and chroma: every accent sits at the same contrast.
    return `oklch(0.72 0.13 ${hueToOklch(hue)})`;
  } catch {
    return null;
  }
}

function hsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [(h * 60 + 360) % 360, max ? d / max : 0, max];
}

/// HSV hue → approximate OKLCH hue (the two wheels are offset and unevenly
/// spaced; piecewise-linear through the primaries/secondaries is close
/// enough for a tint).
function hueToOklch(h: number) {
  const stops: [number, number][] = [
    [0, 29], [60, 110], [120, 142], [180, 195], [240, 264], [300, 328], [360, 389],
  ];
  for (let i = 1; i < stops.length; i++) {
    const [h0, o0] = stops[i - 1];
    const [h1, o1] = stops[i];
    if (h <= h1) return Math.round((o0 + ((h - h0) / (h1 - h0)) * (o1 - o0)) % 360);
  }
  return 29;
}
