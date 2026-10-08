"use client";

import { DropdownMenu } from "radix-ui";
import { SHELVES, useCollection, type Shelf } from "@/context/CollectionContext";
import { Button, type ButtonProps } from "@/components/ui";
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
  const shelf = shelfOf(gameId);
  const label = shelf ? SHELVES.find((s) => s.value === shelf)!.label : "Add to library";

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button
          size={size}
          variant="secondary"
          aria-pressed={!!shelf}
          aria-label={shelf ? `${gameName}: in library, ${label}. Change shelf` : `Add ${gameName} to library`}
          icon={shelf ? "check" : undefined}
          iconRight="chevron-down"
          className={className}
        >
          {label}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-60 origin-(--radix-dropdown-menu-content-transform-origin) border border-ov-border-strong bg-ov-field p-1.5 shadow-ov-pop data-[state=closed]:animate-ov-pop-out data-[state=open]:animate-ov-pop"
        >
          <DropdownMenu.Label className="px-2.5 py-2 font-mono text-micro uppercase tracking-label text-ov-muted">
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
