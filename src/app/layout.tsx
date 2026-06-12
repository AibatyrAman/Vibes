import type { Metadata } from "next";
import { Anton, Space_Mono, Permanent_Marker, Caveat } from "next/font/google";
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
  title: "Vibes — Kahveden Kokteyle",
  description:
    "Gündüz nitelikli kahve, akşamüstü Golden Hours: şarap, bira ve kokteyl. Vibes — kahveden kokteyle, her gün 08:00–20:00.",
  openGraph: {
    title: "Vibes — Kahveden Kokteyle",
    description:
      "Gündüz kahve, akşam aperitivo. Golden Hours her gün 08:00–20:00.",
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
      <body className="min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
