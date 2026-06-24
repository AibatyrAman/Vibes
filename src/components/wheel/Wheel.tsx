"use client";

import { useMemo, useState } from "react";
import type { WheelSlot, SpinResult } from "@/lib/wheel-repo";
import { spinAction } from "@/app/customer-actions";

const SPIN_MS = 3800;
const EXTRA_TURNS = 5;

/** Her slotun [başlangıç, bitiş, orta] açısını angle ağırlığına göre hesaplar. */
function useSlices(slots: WheelSlot[]) {
  return useMemo(() => {
    const total = slots.reduce((s, x) => s + x.angle, 0) || 1;
    return slots.map((_, i) => {
      const before = slots.slice(0, i).reduce((s, x) => s + x.angle, 0);
      const from = (before / total) * 360;
      const to = ((before + slots[i].angle) / total) * 360;
      return { from, to, mid: (from + to) / 2 };
    });
  }, [slots]);
}

export default function Wheel({
  slots,
  pendingPrizes,
}: {
  slots: WheelSlot[];
  pendingPrizes: { id: number; label: string; prizeCode: string }[];
}) {
  const slices = useSlices(slots);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gradient = useMemo(() => {
    const stops = slots.map((s, i) => `${s.color} ${slices[i].from}deg ${slices[i].to}deg`);
    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, [slots, slices]);

  async function handleSpin() {
    if (spinning || result) return;
    setSpinning(true);
    setError(null);
    const res = await spinAction();
    if (!res.ok) {
      setError(res.error);
      setSpinning(false);
      return;
    }
    const r = res.result;
    const thetaMid = slices[r.slotIndex]?.mid ?? 0;
    const mod = ((rotation % 360) + 360) % 360;
    const baseAdd = (((-thetaMid - mod) % 360) + 360) % 360;
    setRotation((prev) => prev + EXTRA_TURNS * 360 + baseAdd);
    setTimeout(() => {
      setResult(r);
      setSpinning(false);
    }, SPIN_MS);
  }

  return (
    <div className="grid place-items-center gap-6">
      <div className="relative" style={{ width: 280, height: 280 }}>
        {/* işaretçi */}
        <div
          className="absolute -top-2 left-1/2 z-10 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "22px solid var(--color-ink)",
          }}
        />
        {/* çark */}
        <div
          className="size-full rounded-full border-4 border-ink shadow-pop-lg"
          style={{
            background: gradient,
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.18, 0.85, 0.25, 1)`
              : "none",
          }}
        >
          {slots.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 flex justify-center"
              style={{ transform: `rotate(${slices[i].mid}deg)` }}
            >
              <span className="mt-3 max-w-[80px] text-center font-mono text-[10px] font-bold uppercase leading-tight text-paper">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {/* merkez göbek */}
        <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-paper shadow-pop-sm" />
      </div>

      {!result && (
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          className="border-2 border-ink bg-navy px-8 py-3 font-display text-2xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {spinning ? "Dönüyor…" : "Çevir!"}
        </button>
      )}

      {error && <p className="font-mono text-sm text-red">{error}</p>}

      {result && !spinning && (
        <div className="max-w-sm border-2 border-ink bg-white p-5 text-center shadow-pop">
          {result.won ? (
            <>
              <p className="font-display text-3xl uppercase leading-none text-navy">
                🎉 Kazandın!
              </p>
              <p className="mt-2 font-hand text-2xl text-ink">{result.label}</p>
              {result.prizeCode && (
                <>
                  <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Garsona göster
                  </p>
                  <p className="mt-1 border-2 border-ink bg-red px-4 py-2 font-mono text-2xl font-bold tracking-widest text-paper">
                    {result.prizeCode}
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="font-display text-2xl uppercase leading-none text-ink/70">
              {result.label || "Bir dahaki sefere!"}
            </p>
          )}
        </div>
      )}

      {pendingPrizes.length > 0 && (
        <div className="grid w-full max-w-sm gap-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
            Henüz kullanmadığın kodların
          </p>
          {pendingPrizes.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2"
            >
              <span className="font-hand text-lg text-ink">{p.label}</span>
              <span className="border-2 border-ink bg-red px-2 py-1 font-mono text-sm font-bold tracking-widest text-paper">
                {p.prizeCode}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
