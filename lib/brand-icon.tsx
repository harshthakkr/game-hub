/** @jsxRuntime automatic */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/// The "//" brand mark as a square PNG. Shared by the tab icon (transparent),
/// the Apple touch icon (solid, since iOS and Safari fill transparency with
/// black or white) and scripts/favicon.ts, which builds app/favicon.ico.
export async function brandIcon(px: number, { background = "transparent", scale = 26 / 32 } = {}) {
  const orbitronBlack = await readFile(join(process.cwd(), "assets/fonts/Orbitron-Black.woff"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background,
        }}
      >
        <div
          style={{
            color: "#2dd4bf",
            fontFamily: "Orbitron",
            fontSize: Math.round(px * scale),
            letterSpacing: `${-px / 16}px`,
          }}
        >
          {"//"}
        </div>
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Orbitron", data: orbitronBlack, style: "normal", weight: 900 }],
    }
  );
}
