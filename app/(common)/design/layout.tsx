import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design system",
  description: "Overdrive design tokens and components, rendered live from production code.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
