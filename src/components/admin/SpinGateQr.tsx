"use client";

import { useEffect, useState } from "react";
import { getGateQrAction } from "@/app/admin/wheel-actions";

const REFRESH_MS = 25_000;

/** Dakikada bir değişen alkol-kapısı QR'ı — barmen alkol alan müşteriye okutur. */
export default function SpinGateQr() {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const res = await getGateQrAction();
      if (alive) setSvg(res.svg);
    };
    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-5 border-2 border-ink bg-paper p-5 shadow-pop">
      <div className="grid size-[160px] shrink-0 place-items-center overflow-hidden border-2 border-ink bg-white p-2">
        {svg ? (
          <div
            className="size-full [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <span className="font-mono text-xs text-ink/40">Yükleniyor…</span>
        )}
      </div>
      <div className="max-w-sm">
        <p className="font-display text-2xl uppercase leading-none text-navy">
          Alkol Kapısı QR
        </p>
        <p className="mt-2 font-mono text-xs text-ink/60">
          Sadece alkol alan müşteriye okut — her okutma 1 çevirme hakkı açar.
          Kod ~1 dakikada bir değişir, ekran görüntüsü işe yaramaz.
        </p>
      </div>
    </div>
  );
}
