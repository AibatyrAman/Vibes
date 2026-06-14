"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, RotateCcw, Save } from "lucide-react";
import type { GlassType } from "@/data/menu";
import type { Point } from "@/lib/glass-cavity";
import { pointsToClip } from "@/lib/glass-cavity";
import { GLASS_LABELS, GLASSES } from "@/components/anatomy/glasses";
import {
  resetGlassCavityAction,
  saveGlassCavityAction,
} from "@/app/admin/actions";

const TYPES = Object.keys(GLASSES) as GlassType[];
// önizleme katmanları (kalibrasyon görseli için örnek renkler)
const SAMPLE = [
  { color: "#d8b24a", percent: 40 },
  { color: "#db1010", percent: 30 },
  { color: "#1800ad", percent: 30 },
];

export default function GlassCalibrator({
  overrides,
}: {
  overrides: Record<string, Point[]>;
}) {
  const [type, setType] = useState<GlassType>(TYPES[0]);
  const [points, setPoints] = useState<Point[]>(
    () => overrides[TYPES[0]] ?? GLASSES[TYPES[0]].points,
  );
  const [drag, setDrag] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const glass = GLASSES[type];
  const [vbX, vbY, vbW, vbH] = glass.viewBox.split(/\s+/).map(Number);

  // ekran boyutu — viewBox oranını koru (koordinat eşlemesi lineer olsun)
  const aspect = vbW / vbH;
  let dispH = 440;
  let dispW = dispH * aspect;
  if (dispW > 380) {
    dispW = 380;
    dispH = dispW / aspect;
  }
  const scale = dispH / vbH; // viewBox→px
  const r = 11 / scale; // tutamaç yarıçapı (~11px)
  const sw = 1.6 / scale; // çizgi kalınlığı (~1.6px)

  function selectType(t: GlassType) {
    setType(t);
    setPoints(overrides[t] ?? GLASSES[t].points);
    setStatus("idle");
  }

  function clientToSvg(e: ReactPointerEvent): Point {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = vbX + ((e.clientX - rect.left) / rect.width) * vbW;
    const y = vbY + ((e.clientY - rect.top) / rect.height) * vbH;
    return [Math.round(x), Math.round(y)];
  }

  function onHandleDown(i: number, e: ReactPointerEvent) {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag(i);
    setStatus("idle");
  }
  function onMove(e: ReactPointerEvent) {
    if (drag == null) return;
    const p = clientToSvg(e);
    setPoints((ps) => ps.map((q, j) => (j === drag ? p : q)));
  }
  function onUp() {
    setDrag(null);
  }

  function addPoint() {
    // en uzun kenarın ortasına nokta ekle
    let best = 0;
    let bestLen = -1;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len > bestLen) {
        bestLen = len;
        best = i;
      }
    }
    const a = points[best];
    const b = points[(best + 1) % points.length];
    const mid: Point = [
      Math.round((a[0] + b[0]) / 2),
      Math.round((a[1] + b[1]) / 2),
    ];
    setPoints((ps) => [...ps.slice(0, best + 1), mid, ...ps.slice(best + 1)]);
  }

  function removePoint(i: number) {
    if (points.length <= 3) return;
    setPoints((ps) => ps.filter((_, j) => j !== i));
  }

  async function save() {
    setStatus("saving");
    await saveGlassCavityAction(type, points);
    setStatus("saved");
    router.refresh();
  }
  async function reset() {
    await resetGlassCavityAction(type);
    setPoints(GLASSES[type].points);
    setStatus("idle");
    router.refresh();
  }

  const clip = pointsToClip(points);
  const ys = points.map((p) => p[1]);
  const yTop = Math.min(...ys);
  const yBottom = Math.max(...ys);
  const H = yBottom - yTop;
  const rects = SAMPLE.map((l, i) => {
    const below = SAMPLE.slice(0, i).reduce(
      (s, p) => s + (p.percent / 100) * H,
      0,
    );
    const h = (l.percent / 100) * H;
    return { ...l, y: yBottom - below - h, h };
  });

  const dirty =
    JSON.stringify(points) !==
    JSON.stringify(overrides[type] ?? GLASSES[type].points);

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      {/* editör */}
      <div className="border-2 border-ink bg-white p-4 shadow-pop">
        <svg
          ref={svgRef}
          viewBox={glass.viewBox}
          width={dispW}
          height={dispH}
          className="touch-none select-none"
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          <defs>
            <clipPath id="cal-clip">
              <path d={clip} />
            </clipPath>
          </defs>
          {/* sıvı önizleme */}
          <g clipPath="url(#cal-clip)">
            {rects.map((l, i) => (
              <rect
                key={i}
                x={vbX}
                width={vbW}
                y={l.y}
                height={l.h}
                fill={l.color}
                opacity={0.85}
              />
            ))}
          </g>
          {/* bardak konturu */}
          <g fill="#1800ad" className="pointer-events-none">
            {glass.outline.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {/* poligon kenarları */}
          <path
            d={clip}
            fill="none"
            stroke="#db1010"
            strokeWidth={sw}
            strokeDasharray={`${sw * 3} ${sw * 2}`}
            className="pointer-events-none"
          />
          {/* tutamaçlar */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r={r}
              fill={drag === i ? "#db1010" : "#ffffff"}
              stroke="#111827"
              strokeWidth={sw}
              className="cursor-grab"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => onHandleDown(i, e)}
              onDoubleClick={() => removePoint(i)}
            />
          ))}
        </svg>
        <p className="mt-2 max-w-[380px] font-mono text-[11px] leading-snug text-ink/50">
          Noktaları sürükle · en uzun kenara nokta eklemek için “Nokta ekle” ·
          bir noktayı silmek için üzerine çift tıkla (en az 3 nokta).
        </p>
      </div>

      {/* kontroller */}
      <div className="grid content-start gap-5">
        <div>
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
            Bardak
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const isOverridden = !!overrides[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => selectType(t)}
                  className={`border-2 border-ink px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5 ${
                    t === type
                      ? "bg-navy text-paper shadow-pop-sm"
                      : "bg-paper text-ink"
                  }`}
                >
                  {GLASS_LABELS[t]}
                  {isOverridden && (
                    <span
                      title="Özel ayar var"
                      className="ml-1.5 inline-block size-2 rounded-full bg-red align-middle"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addPoint}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5"
          >
            <Plus strokeWidth={3} className="size-4" />
            Nokta ekle
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform hover:-translate-y-0.5"
          >
            <RotateCcw strokeWidth={2.5} className="size-4" />
            Varsayılana sıfırla
          </button>
          <button
            type="button"
            onClick={save}
            disabled={status === "saving" || !dirty}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-navy px-5 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper shadow-pop-sm transition-transform hover:-translate-y-0.5 disabled:opacity-40"
          >
            <Save strokeWidth={2.5} className="size-4" />
            {status === "saving"
              ? "Kaydediliyor…"
              : status === "saved"
                ? "Kaydedildi ✓"
                : "Kaydet"}
          </button>
        </div>

        <div className="border-2 border-dashed border-ink/30 bg-paper-dim/40 p-4 font-mono text-[11px] leading-relaxed text-ink/60">
          <p className="mb-1 font-bold uppercase tracking-widest text-ink/50">
            Nasıl çalışır
          </p>
          Sıvı, çizdiğin poligonun içini doldurur ve en alttaki noktadan yukarı
          yükselir. Bardağın iç camına oturacak şekilde noktaları ayarla;
          kaydedince menüde o bardağı kullanan tüm ürünlere uygulanır. Kırmızı
          nokta = özel ayar kayıtlı.
        </div>
      </div>
    </div>
  );
}
