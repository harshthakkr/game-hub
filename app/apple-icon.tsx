import { brandIcon } from "@/lib/brand-icon";

/// Safari (bookmarks, Favourites, some tab bars) and iOS home screens use the
/// Apple touch icon. Solid background: transparency renders as black there.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return brandIcon(size.width, { background: "#05070e", scale: 0.55 });
}
