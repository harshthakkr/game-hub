"use client";

import Image from "next/image";
import { useCallback } from "react";
import { Button, DialogClose, FullscreenDialog, IconButton } from "@/components/ui";

/// Full-bleed image viewer with prev/next navigation. Arrow keys step through the
/// set; Escape, focus trapping and scroll lock come from the dialog primitive.
export function Lightbox({
  open,
  onOpenChange,
  images,
  index,
  alt,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  index: number;
  alt: string;
  onNavigate: (index: number) => void;
}) {
  const count = images.length;

  const step = useCallback(
    (delta: number) => {
      if (count === 0) return;
      onNavigate((index + delta + count) % count);
    },
    [count, index, onNavigate]
  );

  if (count === 0) return null;

  return (
    <FullscreenDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${alt} screenshot ${index + 1} of ${count}`}
    >
      {/* Clicking empty space around the image dismisses, like a backdrop. */}
      <div
        className="flex h-full flex-col"
        onClick={() => onOpenChange(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        <div className="flex shrink-0 items-center gap-4 px-4 py-3.5 lg:px-7">
          <span className="truncate text-body font-semibold text-ov-white">{alt}</span>
          <span className="ml-auto font-hud text-ui text-ov-dim">
            {index + 1} / {count}
          </span>
          <DialogClose asChild>
            <Button size="sm" variant="outline" icon="close">
              Close
            </Button>
          </DialogClose>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 lg:px-16">
          <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
            <Image
              key={images[index]}
              src={images[index]}
              alt={`${alt} screenshot ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {count > 1 && (
            <>
              <IconButton
                variant="outline"
                icon="chevron-left"
                label="Previous image"
                iconClassName="text-lg"
                onClick={(event) => {
                  event.stopPropagation();
                  step(-1);
                }}
                className="absolute left-1 top-1/2 -translate-y-1/2 lg:left-3"
              />
              <IconButton
                variant="outline"
                icon="chevron-right"
                label="Next image"
                iconClassName="text-lg"
                onClick={(event) => {
                  event.stopPropagation();
                  step(1);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 lg:right-3"
              />
            </>
          )}
        </div>

        {count > 1 && (
          <div
            className="shrink-0 overflow-x-auto px-4 pb-4 lg:px-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => onNavigate(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`relative h-[44px] w-[74px] shrink-0 overflow-hidden border transition-[border-color,opacity,scale] duration-150 hover:scale-105 ${
                    i === index ? "border-ov-teal" : "border-ov-border opacity-50"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="74px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FullscreenDialog>
  );
}
