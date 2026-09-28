import type { Metadata, Viewport } from "next";
import { Gloock, Figtree, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const gloock = Gloock({ weight: "400", subsets: ["latin"], variable: "--font-gloock", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const tiro = Tiro_Devanagari_Hindi({ weight: "400", subsets: ["devanagari", "latin"], variable: "--font-tiro", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3740"),
  title: { default: "Gaurgram · Bilona ghee, fresh milk & raw honey from our goshala", template: "%s · Gaurgram" },
  description:
    "Bilona ghee, fresh desi cow milk, matka dahi, lassi, kheer, raw honey and cold-pressed oils, straight from our goshala to your home. Glass packaging, no middleman. Daily delivery in Chandigarh, Mohali, Panchkula and Zirakpur.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${gloock.variable} ${figtree.variable} ${tiro.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
