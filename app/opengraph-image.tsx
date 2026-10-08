import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GAME//HUB: every game, every price drop, every showcase";

/// Default link-preview card for pages without their own.
const HEADLINE = "Every game, every price drop, every showcase.";
const SUBLINE = "PlayStation Store and Steam prices in INR · live events · player verdicts";

export default async function OpenGraphImage() {
  const fonts = await ogFonts(`GAME//HUB${HEADLINE}${SUBLINE}`);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          padding: 96,
          background: "radial-gradient(ellipse at 80% 10%, rgba(45,212,191,0.18), #05070e 60%)",
          color: "#e6ebf2",
        }}
      >
        <div style={{ fontSize: 40, letterSpacing: 6, color: "#2dd4bf", fontWeight: 700 }}>GAME//HUB</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          {HEADLINE}
        </div>
        <div style={{ fontSize: 30, color: "#a3aebf" }}>
          {SUBLINE}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
