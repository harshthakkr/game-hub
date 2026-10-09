import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
  description: "Your games on shelves: playing, backlog and finished.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
