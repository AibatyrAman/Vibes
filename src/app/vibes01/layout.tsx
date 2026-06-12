import type { Metadata } from "next";
import { Chewy, Oswald } from "next/font/google";

// Logo fontu "Cheddar" Google Fonts'ta yok → en yakın bubbly: Chewy (geçici).
const chewy = Chewy({
  variable: "--font-chewy",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vibes — no rush, just vibes",
  description: "Where every visit feels like the right vibe.",
};

export default function Vibes01Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // lang="en" → İngilizce slogan; CSS uppercase Türkçe "İ" yerine "I" üretir.
  return (
    <div lang="en" className={`${chewy.variable} ${oswald.variable}`}>
      {children}
    </div>
  );
}
