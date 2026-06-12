import { ArrowDown, Sparkles } from "lucide-react";
import LiquidCup from "./scrap/LiquidCup";
import LiquidGlass from "./scrap/LiquidGlass";
import TapeStrip from "./scrap/TapeStrip";
import Sticker from "./scrap/Sticker";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b-4 border-ink bg-paper"
    >
      {/* faint scrap shapes in the back */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-24 size-40 rotate-12 border-[3px] border-ink/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 bottom-8 size-24 -rotate-6 rounded-full border-[3px] border-red/20"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
        {/* ---- left: headline ---- */}
        <div className="relative z-10">
          <p className="animate-pop-in mb-5 inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] shadow-pop-sm sm:text-xs">
            <Sparkles strokeWidth={2.5} className="size-4 text-red" />
            Gündüz kahve · Akşam aperitivo
          </p>

          <h1 className="font-display uppercase leading-[0.82]">
            <span
              className="animate-pop-in block text-[clamp(3.2rem,13vw,8.5rem)] text-navy text-pop-red [rotate:-2deg]"
              style={{ animationDelay: "0.06s" }}
            >
              Kahveden
            </span>
            <span
              className="animate-pop-in block text-[clamp(3.2rem,13vw,8.5rem)] text-red text-pop-navy [rotate:1deg]"
              style={{ animationDelay: "0.13s" }}
            >
              Kokteyle<span className="text-ink">.</span>
            </span>
          </h1>

          <p
            className="animate-pop-in mt-6 max-w-md font-mono text-sm leading-relaxed text-ink/80 sm:text-base"
            style={{ animationDelay: "0.22s" }}
          >
            Sabah filtre &amp; espresso, gün batımında spritz, şarap ve kokteyl.
            Vibes her gün <span className="font-bold text-ink">08:00</span>&apos;de
            açar, <span className="font-bold text-ink">20:00</span>&apos;de
            kapanır.
          </p>

          <div
            className="animate-pop-in mt-8 flex flex-wrap gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#menu"
              className="group inline-flex items-center gap-2 border-2 border-ink bg-navy px-6 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-all hover:-translate-y-1 hover:shadow-pop-lg active:translate-y-0 active:shadow-pop-sm"
            >
              Menüye göz at
              <ArrowDown
                strokeWidth={2.5}
                className="size-5 transition-transform group-hover:translate-y-0.5"
              />
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-6 py-3 font-display text-xl uppercase tracking-wide text-ink shadow-pop-red transition-all hover:-translate-y-1 hover:shadow-pop-red-lg active:translate-y-0"
            >
              Golden Hours
            </a>
          </div>
        </div>

        {/* ---- right: collage ---- */}
        <div className="relative mx-auto h-[440px] w-full max-w-sm md:h-[520px]">
          {/* navy backdrop panel */}
          <div
            className="animate-pop-in absolute right-2 top-6 h-[300px] w-[230px] border-2 border-ink bg-navy shadow-pop-red"
            style={{ animationDelay: "0.15s", rotate: "5deg" }}
          />

          {/* aperitivo glass frame */}
          <div
            className="animate-pop-in absolute left-0 top-0 w-[180px] border-2 border-ink bg-paper p-3 pb-4 shadow-pop"
            style={{ animationDelay: "0.24s", rotate: "-6deg" }}
          >
            <TapeStrip className="-left-4 -top-3 w-20" rotate={-12} />
            <LiquidGlass className="h-[230px] w-full" />
            <p className="mt-1 text-center font-mono text-[11px] font-bold uppercase tracking-widest">
              Aperol Spritz
            </p>
          </div>

          {/* espresso cup frame */}
          <div
            className="animate-pop-in absolute bottom-0 right-0 w-[172px] border-2 border-ink bg-paper p-3 pb-4 shadow-pop-navy"
            style={{ animationDelay: "0.32s", rotate: "7deg" }}
          >
            <TapeStrip className="-right-3 -top-3 w-20" rotate={10} tone="red" />
            <LiquidCup className="h-[220px] w-full" />
            <p className="mt-1 text-center font-mono text-[11px] font-bold uppercase tracking-widest">
              Espresso Doppio
            </p>
          </div>

          {/* golden hours stamp */}
          <div
            className="animate-pop-in absolute right-1 top-0 z-20"
            style={{ animationDelay: "0.4s" }}
          >
            <Sticker className="size-[84px] p-2 text-[10px] leading-tight">
              Golden
              <br />
              Hours
              <br />
              08—20
            </Sticker>
          </div>
        </div>
      </div>
    </section>
  );
}
