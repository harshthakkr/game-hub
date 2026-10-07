import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CornerDownRight,
  EyeOff,
  Heart,
  LayoutGrid,
  Library,
  List,
  Maximize2,
  Menu,
  MessageSquare,
  Pencil,
  Play,
  Plus,
  Search,
  SendHorizontal,
  TrendingDown,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  search: Search,
  heart: Heart,
  "heart-filled": Heart,
  library: Library,
  grid: LayoutGrid,
  list: List,
  clock: Clock,
  play: Play,
  close: X,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  reminder: Bell,
  send: SendHorizontal,
  menu: Menu,
  check: Check,
  plus: Plus,
  comment: MessageSquare,
  reply: CornerDownRight,
  spoiler: EyeOff,
  edit: Pencil,
  user: User,
  expand: Maximize2,
  "trend-down": TrendingDown,
  "trend-up": TrendingUp,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/// Solid glyphs: filled with currentColor rather than outlined.
const FILLED = new Set<IconName>(["heart-filled", "play"]);

/// Lucide icon sized in `em`, so a text-size class on `className` sets the
/// icon size and it lines up with adjacent text the way a glyph would.
export function OvIcon({
  name,
  className = "text-sm",
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = ICONS[name];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
      style={style}
    >
      <Icon
        size="1em"
        strokeWidth={2.25}
        fill={FILLED.has(name) ? "currentColor" : "none"}
      />
    </span>
  );
}
