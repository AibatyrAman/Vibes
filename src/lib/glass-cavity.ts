// İçecek anatomisi — sıvı dolum bölgesi (cavity) yardımcıları.
// Pure (server/client her ikisinde kullanılır). Bardak iç hacmi bir poligon
// (nokta listesi) olarak tutulur; admin "Bardak Kalibrasyon" aracı bunu düzenler.

export type Point = [number, number];

/** Poligon noktalarından SVG clipPath 'd' üretir. */
export function pointsToClip(points: Point[]): string {
  if (points.length < 3) return "";
  return (
    "M" +
    points.map(([x, y], i) => `${i ? "L" : ""}${x} ${y}`).join(" ") +
    " Z"
  );
}

/** Sıvı katmanlarının yerleşeceği dikey aralık [yTop, yBottom]. */
export function pointsToCavity(points: Point[]): [number, number] {
  if (!points.length) return [0, 0];
  const ys = points.map((p) => p[1]);
  return [Math.min(...ys), Math.max(...ys)];
}

/** settings'ten okunan ham JSON'u güvenle Point[]'e çevirir. */
export function parsePoints(raw: string | null | undefined): Point[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (
      Array.isArray(v) &&
      v.every(
        (p) =>
          Array.isArray(p) &&
          p.length === 2 &&
          typeof p[0] === "number" &&
          typeof p[1] === "number",
      )
    )
      return v as Point[];
  } catch {
    /* yok say */
  }
  return null;
}

export const GLASS_CAVITY_KEY = (type: string) => `glass_cav_${type}`;
