import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Genres",
  description: "Browse games by genre.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
