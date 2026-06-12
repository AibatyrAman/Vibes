import { Clock, Martini } from "lucide-react";
import Logo from "./Logo";

/** Thin sticky top bar: vibes logo on the left, hours on the right. */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-red bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <a href="#top" className="group flex items-center" aria-label="vibes — başa dön">
          <Logo className="h-6 text-red transition-transform group-hover:-rotate-2 sm:h-7" />
        </a>

        <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest sm:text-xs">
          <Clock strokeWidth={2.5} className="size-4 animate-flicker text-red" />
          <span className="hidden sm:inline">Her gün ·</span>
          <span>10:00–22:00</span>
          <Martini strokeWidth={2.5} className="ml-1 size-4 text-red" />
        </div>
      </div>
    </header>
  );
}
