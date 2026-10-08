import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Geist, Orbitron } from "next/font/google";
import "./globals.css";

// The product's voice: angular, HUD-like. All UI type (headings, nav,
// buttons, labels, readouts).
const chakra = Chakra_Petch({
  variable: "--font-chakra-next",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Long reading text only (descriptions, reviews, Concierge replies), where
// Chakra Petch gets tiring at small sizes.
const geist = Geist({
  variable: "--font-geist-next",
  subsets: ["latin"],
});

// Display face: the logo, page titles and big numerals.
const orbitron = Orbitron({
  variable: "--font-orbitron-next",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "GAME//HUB", template: "%s · GAME//HUB" },
  description:
    "Discover games, track PlayStation Store and Steam prices in INR, and follow every showcase.",
  applicationName: "GAME//HUB",
  openGraph: { siteName: "GAME//HUB", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
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
        className={`${chakra.variable} ${geist.variable} ${orbitron.variable} bg-ov-bg font-sans text-ov-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
