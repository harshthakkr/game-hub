import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Browse every game: filter by genre, platform, year and critic rating, with PlayStation Store and Steam prices.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
