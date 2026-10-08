"use client";

import { Dialog } from "@/components/ui";

/// Plays a YouTube trailer in place, via the privacy-enhanced nocookie host.
/// The iframe only exists while the dialog is open, so closing stops playback.
export function TrailerDialog({
  videoId,
  title,
  open,
  onOpenChange,
}: {
  videoId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="TRAILER"
      title={title}
      className="max-w-[1100px]"
    >
      <div className="px-6 pt-2 pb-6">
        <div className="aspect-video w-full border border-ov-border-strong bg-ov-panel">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        </div>
      </div>
    </Dialog>
  );
}
