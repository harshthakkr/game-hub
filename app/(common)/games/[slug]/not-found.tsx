import Link from "next/link";
import { Button } from "@/components/ui";

export default function GameNotFound() {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="font-hud text-micro tracking-label text-ov-muted">404</p>
      <h1 className="text-xl font-semibold">We couldn&apos;t find that game</h1>
      <p className="max-w-sm text-sm text-ov-dim">It may have been renamed or removed from IGDB. Try searching for it instead.</p>
      <Button asChild variant="secondary" className="mt-2">
        <Link href="/games">Back to the catalogue</Link>
      </Button>
    </div>
  );
}
