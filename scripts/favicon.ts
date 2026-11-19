/// Builds app/favicon.ico (16, 32 and 48px PNGs) from the brand mark in
/// lib/brand-icon.tsx. Safari asks for /favicon.ico rather than the PNG icon
/// Chrome uses. Run after changing the mark: npx tsx scripts/favicon.ts
import { writeFile } from "node:fs/promises";
import { brandIcon } from "../lib/brand-icon";

const SIZES = [16, 32, 48];

async function main() {
  const pngs = await Promise.all(
    SIZES.map(async (px) => Buffer.from(await (await brandIcon(px)).arrayBuffer()))
  );
  // ICO: 6-byte header, a 16-byte entry per image, then the PNG data.
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(SIZES[i], 0);
    e.writeUInt8(SIZES[i], 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  await writeFile("app/favicon.ico", Buffer.concat([header, ...entries, ...pngs]));
  console.log(`app/favicon.ico: ${SIZES.join(", ")}px`);
}

main();
