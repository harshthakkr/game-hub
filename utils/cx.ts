/// Joins class names, skipping falsy entries. Deliberately not tailwind-merge:
/// component variants own their colors, sizes and padding, so callers only ever
/// add layout classes (margins, widths) that never conflict.
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
