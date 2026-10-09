import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your wishlisted games, with prices checked every 3 hours on PlayStation Store and Steam.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
