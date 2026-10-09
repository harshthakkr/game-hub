import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const orbitronBlack = await readFile(
    join(process.cwd(), "assets/fonts/Orbitron-Black.woff")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            color: "#2dd4bf",
            fontFamily: "Orbitron",
            fontSize: 26,
            letterSpacing: "-2px",
          }}
        >
          {"//"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Orbitron",
          data: orbitronBlack,
          style: "normal",
          weight: 900,
        },
      ],
    }
  );
}
