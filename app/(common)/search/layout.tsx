import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the game catalogue.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
