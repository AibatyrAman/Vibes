import type { Metadata } from "next";
import { Anton, Space_Mono, Permanent_Marker, Caveat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vibes — no rush, just vibes",
  description:
    "Where every visit feels like the right vibe. Kahve, şarap, kokteyl. Her gün 10:00–22:00, Perlavista AVM, İstanbul.",
  openGraph: {
    title: "vibes — no rush, just vibes",
    description: "Where every visit feels like the right vibe. Her gün 10:00–22:00.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${anton.variable} ${spaceMono.variable} ${permanentMarker.variable} ${caveat.variable} antialiased`}
    >
      <body className="min-h-screen overflow-x-hidden">
        {children}
        {/* Contentsquare UX analitik — app.contentsquare.com.
            beforeInteractive: Next'in "her zaman <head>'e enjekte edilir"
            garantisi verdiği tek strateji — Contentsquare'in kurulum
            doğrulaması <head> içinde ham <script> arıyor. */}
        <Script
          src="https://t.contentsquare.net/uxa/49adca70995a4.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
