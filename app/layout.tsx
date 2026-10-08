import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-next",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono-next",
  subsets: ["latin"],
});

// Display face for the logo and big numerals only.
const orbitron = Orbitron({
  variable: "--font-orbitron-next",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "GAME//HUB",
  description:
    "Discover games, track PlayStation Store and Steam prices in INR, and follow every showcase.",
};

export const viewport: Viewport = {
  // Lets the tab bar and sheets pad themselves with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#05070e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} ${orbitron.variable} bg-ov-bg font-sans text-ov-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
