"use client";

import { useState } from "react";
import { X } from "lucide-react";

function NapkinIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-9" aria-hidden>
      <rect
        x="8"
        y="8"
        width="32"
        height="32"
        rx="2"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="3"
      />
      <path
        d="M8 22 L22 8 M8 31 L31 8 M16 40 L40 16"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle
        cx="31"
        cy="31"
        r="5"
        fill="none"
        stroke="var(--color-red)"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Crumpled napkin pinned to the bottom-right. Tap it and the chef's note
 * unfolds out of the corner like a crumpled paper opening (stop-motion steps).
 */
export default function VirtualNapkin({ note }: { note: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[80] print:hidden">
      {/* note — açılınca mount edilir; napkinUnfold animasyonu (steps) oynar */}
      {open && (
        <div className="animate-napkin absolute bottom-[4.75rem] right-0 w-64 origin-bottom-right border-2 border-ink bg-[#fdfcf7] p-5 shadow-pop">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--color-ink) 0 1px, transparent 1px 13px)",
            }}
          />
          <button
            onClick={() => setOpen(false)}
            aria-label="Kapat"
            className="absolute right-1.5 top-1.5 grid size-6 place-items-center border-2 border-ink bg-red text-paper transition-transform hover:rotate-90"
          >
            <X strokeWidth={3} className="size-3.5" />
          </button>

          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Vibes · peçete notu
          </p>
          <p className="mt-2 font-hand text-2xl leading-none text-red">
            Bugünün Şef Önerisi:
          </p>
          <p className="mt-2 font-hand text-3xl font-bold leading-tight text-ink">
            {note}
          </p>
          <p className="mt-3 text-right font-hand text-xl text-navy">— Vibes</p>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Şef önerisi peçetesi"
        style={{ rotate: "-4deg" }}
        className="group relative grid size-16 place-items-center border-2 border-ink bg-paper shadow-pop transition-transform hover:-translate-y-0.5 hover:animate-wobble"
      >
        <NapkinIcon />
        <span className="absolute -left-2.5 -top-2.5 -rotate-12 border-2 border-ink bg-red px-1.5 font-hand text-base font-bold leading-tight text-paper shadow-pop-sm">
          Şef!
        </span>
      </button>
    </div>
  );
}
