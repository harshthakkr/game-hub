import { ImageResponse } from "next/og";
import { getGame } from "@/lib/games";
import { ogFonts } from "@/lib/og";
import { coverUrl, developerName, formatYear, landscapeArt } from "@/utils/overdrive";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Game card from GAME//HUB";

/// Link-preview card for a game: key art, cover, title, critic score and the
/// best tracked price, so a shared link reads like the page itself.
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGame(slug);
  const art = game ? landscapeArt(game.artworks, game.screenshots) : null;
  const cover = game ? coverUrl(game.cover) : null;
  const score = game?.aggregated_rating ? Math.round(game.aggregated_rating) : null;
  const best = (game?.stores ?? [])
    .filter((s) => s.price)
    .sort((a, b) => a.price!.amount - b.price!.amount)[0];
  const title = game?.name ?? "Game not found";
  const meta = [game && developerName(game.involved_companies), game && formatYear(game.first_release_date)]
    .filter(Boolean)
    .join(" · ");
  const storeLabel = best?.store === "STEAM" ? "STEAM" : "PS STORE";
  const fonts = await ogFonts(
    ["GAME//HUB", title, meta, "CRITIC", score ?? "", storeLabel, best?.price?.current ?? ""].join("")
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#05070e", color: "#e6ebf2", position: "relative" }}>
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.45 }} />
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, #05070e 25%, rgba(5,7,14,0.6) 70%, rgba(5,7,14,0.2))" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 48, padding: 64, width: "100%" }}>
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" width={300} height={400} style={{ objectFit: "cover", border: "2px solid #2c3749" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            <div style={{ fontSize: 26, letterSpacing: 4, color: "#2dd4bf", fontWeight: 700 }}>GAME//HUB</div>
            <div style={{ fontSize: game && game.name.length > 32 ? 56 : 72, fontWeight: 700, lineHeight: 1.05 }}>
              {title}
            </div>
            <div style={{ fontSize: 28, color: "#a3aebf" }}>{meta}</div>
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              {score !== null && (
                <div style={{ display: "flex", flexDirection: "column", border: "2px solid #1e2737", padding: "14px 24px", background: "rgba(10,14,24,0.85)" }}>
                  <span style={{ fontSize: 18, color: "#7a8699", letterSpacing: 2 }}>CRITIC</span>
                  <span style={{ fontSize: 48, fontWeight: 700, color: score >= 75 ? "#2dd4bf" : "#a3aebf" }}>{score}</span>
                </div>
              )}
              {best?.price && (
                <div style={{ display: "flex", flexDirection: "column", border: "2px solid #1e2737", padding: "14px 24px", background: "rgba(10,14,24,0.85)" }}>
                  <span style={{ fontSize: 18, color: "#7a8699", letterSpacing: 2 }}>{storeLabel}</span>
                  <span style={{ fontSize: 48, fontWeight: 700 }}>{best.price.current}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
