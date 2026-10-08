/// Fonts for share cards. next/og's built-in font is Latin-only regular, so
/// ₹ renders as a missing glyph and every weight looks the same. This fetches
/// a Chakra Petch subset (the UI face, which has ₹) holding exactly the
/// card's characters, in two weights.
/// Returns undefined on failure so the card still renders with the default.
export async function ogFonts(text: string) {
  const subset = encodeURIComponent([...new Set(text)].join(""));
  const load = async (weight: 400 | 700) => {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@${weight}&text=${subset}`,
      { cache: "force-cache" }
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) throw new Error("No TrueType source in font CSS");
    const data = await fetch(url, { cache: "force-cache" }).then((res) => res.arrayBuffer());
    return { name: "Chakra Petch", data, weight, style: "normal" as const };
  };
  try {
    return await Promise.all([load(400), load(700)]);
  } catch {
    return undefined;
  }
}
