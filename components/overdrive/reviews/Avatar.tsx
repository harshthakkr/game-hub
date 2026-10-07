import Image from "next/image";
import { initials } from "@/utils/reviews";
import type { ReviewAuthor } from "@/utils/types";

/// Plain square tile: the player's photo, or a single initial on a flat panel
/// fill. Deliberately simple — no gradient or clipped corner, so it reads as an
/// avatar at 24px as clearly as it does at 38px.
export function Avatar({
  author,
  size = 38,
}: {
  author: Pick<ReviewAuthor, "username" | "name" | "image">;
  size?: number;
}) {
  const dimension = { width: size, height: size };

  if (author.image) {
    return (
      <Image
        src={author.image}
        alt=""
        {...dimension}
        className="shrink-0 border border-ov-border object-cover"
        style={dimension}
      />
    );
  }

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center border border-ov-border bg-ov-raised font-orbitron font-bold text-ov-teal"
      style={{ ...dimension, fontSize: Math.round(size * 0.42) }}
    >
      {initials(author)}
    </div>
  );
}
