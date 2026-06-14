import type { GlassType } from "@/data/menu";

export type GlassDef = {
  /** ortak viewBox — tüm bardaklar 0 0 120 170 */
  viewBox: string;
  /** kontur (line-art) path 'd' listesi — stroke parent <g>'de */
  outline: string[];
  /** sıvı hacmi (clipPath) path 'd' — userSpaceOnUse, aynı viewBox */
  clip: string;
  /** sıvı katmanlarının dikey aralığı [yTop, yBottom] (kullanıcı birimi) */
  cavity: [number, number];
  /** jest/süslemenin oturacağı ağız noktası */
  rim: { x: number; y: number };
};

/** Brutalist line-art bardak kayıt defteri. Hepsi 120×170 viewBox. */
export const GLASSES: Record<GlassType, GlassDef> = {
  rocks: {
    viewBox: "0 0 120 170",
    outline: ["M26 46 L32 146 L88 146 L94 46"],
    clip: "M31 52 L36 140 L84 140 L89 52 Z",
    cavity: [52, 140],
    rim: { x: 60, y: 46 },
  },
  highball: {
    viewBox: "0 0 120 170",
    outline: ["M40 18 L44 152 L76 152 L80 18"],
    clip: "M44 24 L48 146 L72 146 L76 24 Z",
    cavity: [24, 146],
    rim: { x: 60, y: 18 },
  },
  martini: {
    viewBox: "0 0 120 170",
    outline: ["M20 26 L60 92 L100 26", "M60 92 L60 148", "M40 152 L80 152"],
    clip: "M28 32 L60 86 L92 32 Z",
    cavity: [32, 86],
    rim: { x: 60, y: 26 },
  },
  coupe: {
    viewBox: "0 0 120 170",
    outline: ["M22 44 Q60 96 98 44", "M60 84 L60 148", "M42 152 L78 152"],
    clip: "M28 46 Q60 88 92 46 Z",
    cavity: [46, 86],
    rim: { x: 60, y: 44 },
  },
  wine: {
    viewBox: "0 0 120 170",
    outline: [
      "M38 24 C30 60 36 96 60 100 C84 96 90 60 82 24",
      "M60 100 L60 150",
      "M42 154 L78 154",
    ],
    clip: "M43 30 C37 60 42 92 60 95 C78 92 83 60 77 30 Z",
    cavity: [30, 95],
    rim: { x: 60, y: 24 },
  },
  mug: {
    viewBox: "0 0 120 170",
    outline: [
      "M30 42 L34 144 L86 144 L90 42",
      "M90 60 C112 60 112 102 90 102",
    ],
    clip: "M35 48 L39 138 L81 138 L85 48 Z",
    cavity: [48, 138],
    rim: { x: 58, y: 42 },
  },
};

export const GLASS_LABELS: Record<GlassType, string> = {
  rocks: "Kısa bardak",
  highball: "Uzun bardak",
  martini: "Martini kadehi",
  coupe: "Coupe kadehi",
  wine: "Şarap kadehi",
  mug: "Kupa",
};
