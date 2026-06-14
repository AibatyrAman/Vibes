"use client";

import { useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { Product } from "@/data/menu";
import { GLASSES } from "./glasses";
import { GARNISH_ART } from "./garnishes";

const VB_H = 170;

/** İnteraktif "İçecek Anatomisi": line-art bardak, aşağıdan yukarı dolan
 *  renkli katmanlar, daktilo etiketleri, jestler ve gerçek fotoğrafa 3D flip. */
export default function DrinkAnatomy({ product }: { product: Product }) {
  const [flipped, setFlipped] = useState(false);
  const clipId = useId();

  if (!product.glassType || !GLASSES[product.glassType]) return null;
  const glass = GLASSES[product.glassType];
  const layers = product.layers ?? [];
  const garnishes = product.garnishes ?? [];
  const [yTop, yBottom] = glass.cavity;
  const H = yBottom - yTop;

  // Katmanları tabandan yukarı yerleştir; her birinin dikey merkezini de hesapla.
  const placed = layers.map((l, i) => {
    const below = layers
      .slice(0, i)
      .reduce((s, p) => s + (p.percent / 100) * H, 0);
    const h = (l.percent / 100) * H;
    const y = yBottom - below - h;
    return { ...l, y, h, center: y + h / 2 };
  });

  const hasPhoto = !!product.photo;

  return (
    <div className="mt-4">
      {/* sahne — 3D flip */}
      <div className="[perspective:1000px]">
        <div
          className="relative transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          {/* ÖN YÜZ — anatomi + etiketler */}
          <div className="[backface-visibility:hidden]">
            <div className="flex items-stretch gap-2">
              {/* bardak */}
              <div
                className="relative shrink-0 text-navy"
                style={{ height: 240, width: (240 * 120) / VB_H }}
              >
                <svg
                  viewBox={glass.viewBox}
                  className="size-full overflow-visible"
                  aria-hidden
                >
                  <defs>
                    <clipPath id={clipId}>
                      <path d={glass.clip} />
                    </clipPath>
                  </defs>
                  {/* sıvılar (maskeli) — taban referanslı yükselme animasyonu */}
                  <g clipPath={`url(#${clipId})`}>
                    <g
                      className="animate-drink-fill"
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "bottom",
                      }}
                    >
                      {placed.map((l, i) => (
                        <rect
                          key={i}
                          x={0}
                          width={120}
                          y={l.y}
                          height={l.h}
                          fill={l.color}
                        />
                      ))}
                    </g>
                  </g>
                  {/* kontur (line-art) */}
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    {glass.outline.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </g>
                </svg>

                {/* jestler — ağız noktasına */}
                {garnishes.map((g, i) => (
                  <span
                    key={g}
                    className="pointer-events-none absolute block size-7 text-navy"
                    style={{
                      left: `${(glass.rim.x / 120) * 100}%`,
                      top: `${(glass.rim.y / VB_H) * 100}%`,
                      transform: `translate(calc(-50% + ${
                        (i - (garnishes.length - 1) / 2) * 18
                      }px), -70%)`,
                    }}
                  >
                    {GARNISH_ART[g]}
                  </span>
                ))}
              </div>

              {/* daktilo etiketleri — her katmanın hizasında */}
              <div className="relative flex-1" style={{ height: 240 }}>
                {placed.map((l, i) => (
                  <div
                    key={i}
                    className="absolute left-0 flex items-center gap-1.5"
                    style={{
                      top: `${(l.center / VB_H) * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <span className="h-px w-5 border-t-2 border-dashed border-ink/40" />
                    <span
                      className="size-2.5 shrink-0 border border-ink"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="font-mono text-[11px] leading-tight text-ink/80">
                      <span className="font-bold">%{l.percent}</span> {l.name}
                    </span>
                  </div>
                ))}
                {placed.length === 0 && (
                  <p className="absolute top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink/40">
                    Katman bilgisi yok.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ARKA YÜZ — gerçek fotoğraf */}
          {hasPhoto && (
            <div
              className="absolute inset-0 grid place-items-center [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${product.photo}`}
                alt={`${product.name} fotoğraf`}
                className="max-h-[240px] w-auto object-contain drop-shadow-[6px_6px_0_rgba(17,24,39,0.25)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* gerçek görseli gör / çizime dön */}
      {hasPhoto && (
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="mt-3 inline-flex items-center gap-1.5 border-2 border-ink bg-navy px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-paper shadow-pop-sm transition-transform hover:-translate-y-0.5"
        >
          <RotateCcw strokeWidth={2.5} className="size-3.5" />
          {flipped ? "Çizime dön" : "Gerçek görseli gör"}
        </button>
      )}
    </div>
  );
}
