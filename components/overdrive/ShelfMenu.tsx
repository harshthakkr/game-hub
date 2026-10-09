"use client";

import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { useIsMobile } from "@/utils/hooks/useMediaQuery";
import { SHELVES, useCollection, type Shelf } from "@/context/CollectionContext";
import { Button, Sheet, SheetOption, type ButtonProps } from "@/components/ui";
import { cx } from "@/utils/cx";
import { OvIcon } from "./OvIcon";

/// "Add to library" button that opens the shelf picker (Playing / Backlog /
/// Finished), or shows the current shelf once saved. Radix DropdownMenu's
/// radio group gives arrow-key navigation and checked-state semantics.
export function ShelfMenu({
  gameId,
  gameName,
  size = "md",
  className,
}: {
  gameId: number;
  gameName: string;
  size?: ButtonProps["size"];
  className?: string;
}) {
  const { shelfOf, setShelf } = useCollection();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const shelf = shelfOf(gameId);
  const label = shelf ? SHELVES.find((s) => s.value === shelf)!.label : "Add to library";
  const trigger = (
    <Button
      size={size}
      variant="secondary"
      // Starts with the visible text (voice control users say what they see).
      aria-label={shelf ? `${label}: ${gameName} is in your library, change shelf` : `Add to library: ${gameName}`}
      icon={shelf ? "check" : undefined}
      iconRight="chevron-down"
      className={className}
      onClick={isMobile ? () => setSheetOpen(true) : undefined}
    >
      {label}
    </Button>
  );

  // Phones get the same choices as a bottom sheet with a line of detail each.
  if (isMobile) {
    return (
      <>
        {trigger}
        <ShelfSheet gameId={gameId} gameName={gameName} open={sheetOpen} onOpenChange={setSheetOpen} />
      </>
    );
  }

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-60 origin-(--radix-dropdown-menu-content-transform-origin) border border-ov-border-strong bg-ov-field p-1.5 shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
        >
          <DropdownMenu.Label className="px-2.5 py-2 font-hud text-micro uppercase tracking-label text-ov-muted">
            Save to shelf
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={shelf ?? ""}
            onValueChange={(value) => setShelf(gameId, value as Shelf)}
          >
            {SHELVES.map((s) => (
              <DropdownMenu.RadioItem
                key={s.value}
                value={s.value}
                className="flex cursor-pointer items-center justify-between px-2.5 py-2.5 text-sm text-ov-text outline-none data-[highlighted]:bg-ov-raised data-[highlighted]:text-ov-white"
              >
                {s.label}
                <DropdownMenu.ItemIndicator>
                  <OvIcon name="check" className="text-sm text-ov-teal" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
          {shelf && (
            <>
              <DropdownMenu.Separator className="my-1.5 h-px bg-ov-border" />
              <DropdownMenu.Item
                onSelect={() => setShelf(gameId, null)}
                className={cx(
                  "flex cursor-pointer px-2.5 py-2.5 text-sm text-ov-rose-soft outline-none data-[highlighted]:bg-ov-rose-wash"
                )}
              >
                Remove from library
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/// The shelf picker as a bottom sheet (phones). Exported so a custom trigger,
/// like the detail page's sticky action bar, can open it.
export function ShelfSheet({
  gameId,
  gameName,
  open,
  onOpenChange,
}: {
  gameId: number;
  gameName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { shelfOf, setShelf } = useCollection();
  const shelf = shelfOf(gameId);
  const choose = (value: Shelf | null) => {
    setShelf(gameId, value);
    onOpenChange(false);
  };
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={shelf ? "Change shelf" : "Add to library"}
      subtitle={gameName}
    >
      <div role="radiogroup" aria-label="Shelf" className="pb-2">
        {SHELVES.map((s) => (
          <SheetOption
            key={s.value}
            label={s.label}
            detail={s.detail}
            selected={shelf === s.value}
            onSelect={() => choose(s.value)}
            marker={<span aria-hidden className={cx("size-2.5 shrink-0 rotate-45", s.marker)} />}
          />
        ))}
        {shelf && (
          <button
            type="button"
            onClick={() => choose(null)}
            className="mt-1.5 flex h-[52px] w-full items-center border-t border-ov-border px-4 text-body text-ov-rose-soft"
          >
            Remove from library
          </button>
        )}
      </div>
    </Sheet>
  );
}
