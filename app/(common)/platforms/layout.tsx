import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platforms",
  description: "Browse games by hardware: PS5, Xbox, Switch, PC and more.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
