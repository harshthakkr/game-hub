import type { Verdict } from "@/utils/reviews";

export type StoreId = "PLAYSTATION" | "STEAM";

/// A tracked store price, as summarised by lib/prices.ts.
export interface PriceInfo {
  free: boolean;
  /// Whole rupees; 0 when free.
  amount: number;
  /// Regular (pre-discount) price in whole rupees.
  baseAmount: number;
  current: string;
  original: string | null;
  discountPercent: number;
  fetchedAt: string;
}

/// The cheapest tracked price for a game across stores.
export interface BestPriceInfo extends PriceInfo {
  store: StoreId;
  storeLabel: string;
  /// On sale at the lowest price seen in the last 30 days.
  atLow: boolean;
}

export interface StoreListing {
  store: StoreId;
  label: string;
  url: string;
  price: PriceInfo | null;
}

export interface GamePageProps {
  id?: number;
  name: string;
  cover: { url: string };
  summary: string;
  storyline?: string;
  release_dates: { human: string }[];
  first_release_date?: number;
  aggregated_rating?: number;
  platforms: { name: string }[];
  screenshots: { url: string; height: number; width: number }[];
  artworks?: { url: string; height: number; width: number }[];
  videos: { video_id: string }[];
  /// Stores the game is listed on, PS Store first, with tracked prices.
  stores: StoreListing[];
  /// Vivid hue from the cover (lib/accent.ts) for the hero's ambient light.
  accent?: string | null;
  hypes?: number;
  genres: { name: string }[];
  involved_companies: {
    developer: boolean;
    publisher: boolean;
    company: { name: string };
  }[];
  similar_games: {
    name: string;
    slug: string;
    id: number;
    cover: {
      url: string;
    };
    aggregated_rating?: number;
    first_release_date?: number;
    genres?: { name: string }[];
    hypes?: number;
  }[];
}

export interface GameCardProps {
  id?: number;
  name: string;
  slug: string;
  cover?: {
    url: string;
  };
  aggregated_rating?: number;
  first_release_date?: number;
  genres?: { name: string }[];
  hypes?: number;
  platforms?: { abbreviation?: string }[];
  involved_companies?: {
    developer: boolean;
    publisher: boolean;
    company: { name: string };
  }[];
  /// Present only for games whose price we track.
  price?: BestPriceInfo;
}

/// A Discover hero slide: a card plus the art and copy the hero needs.
export interface HeroGame extends GameCardProps {
  summary?: string;
  artworks?: { url: string; width?: number; height?: number }[];
  screenshots?: { url: string; width?: number; height?: number }[];
  videos?: { video_id: string }[];
}

export interface DiscoverData {
  hero: HeroGame[];
  trending: { hype: GameCardProps[]; rating: GameCardProps[] };
  releases: GameCardProps[];
}

export interface CardProps {
  id: number;
  name: string;
  slug: string;
  developed?: unknown[];
  platform_family?: { name: string };
}

export interface DeveloperPageProps {
  id?: number;
  name?: string;
  description?: string;
  developed?: GameCardProps[];
  websites?: {
    id: number;
    url: string;
  }[];
}

export interface EventCardProps {
  id: number;
  slug: string;
  name: string;
  description?: string;
  start_time?: number;
  end_time?: number;
  event_logo?: {
    url: string;
  };
}

export interface EventPageProps {
  id?: number;
  name?: string;
  description?: string;
  start_time?: number;
  end_time?: number;
  event_logo?: {
    url: string;
  };
  games?: GameCardProps[];
  live_stream_url?: string;
}

export interface ReviewAuthor {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export interface ReviewComment {
  id: string;
  createdAt: string;
  body: string;
  reviewId: string;
  parentId: string | null;
  author: ReviewAuthor;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
  replies: ReviewComment[];
}

export interface ReviewProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  gameId: number;
  gameSlug: string;
  gameName: string;
  body: string;
  wordCount: number;
  verdict: Verdict;
  hasSpoilers: boolean;
  author: ReviewAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export type VerdictCounts = Record<Verdict, number>;

export interface ReviewStats {
  total: number;
  counts: VerdictCounts;
  consensus: Verdict | null;
  spoilerCount: number;
}

export interface ReviewsResponse {
  reviews: ReviewProps[];
  page: number;
  pages: number;
  total: number;
  stats: ReviewStats;
  myReview: ReviewProps | null;
}
