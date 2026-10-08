import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
  description: "Live and upcoming gaming showcases and broadcasts, in your local time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
