import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers",
  description: "Studios and publishers in the catalogue.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
