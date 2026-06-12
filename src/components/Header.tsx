import { Coffee, Martini, Clock } from "lucide-react";

/**
 * Thin sticky top bar: VIBES wordmark stamp on the left, Golden Hours on the
 * right. Ink slab with a red cut-line underneath.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-red bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <a href="#top" className="group flex items-center gap-2">
          <Coffee
            strokeWidth={2.5}
            className="size-6 text-red transition-transform group-hover:-rotate-12"
          />
          <span className="font-display text-2xl leading-none tracking-wide text-paper text-pop-red [rotate:-3deg]">
            VIBES
          </span>
        </a>

        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest sm:text-xs">
          <Clock strokeWidth={2.5} className="size-4 text-red animate-flicker" />
          <span className="hidden sm:inline">Golden Hours ·</span>
          <span>08:00–20:00</span>
          <Martini strokeWidth={2.5} className="ml-1 size-4 text-red" />
        </div>
      </div>
    </header>
  );
}
