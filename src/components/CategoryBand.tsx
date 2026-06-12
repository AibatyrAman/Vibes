import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  kicker: string;
  accent: "navy" | "red";
  /** when provided, renders as an accordion toggle button */
  open?: boolean;
  onToggle?: () => void;
  panelId?: string;
};

/**
 * Category header on an ink "tape" slab with a colored offset shadow.
 * Static by default; pass `onToggle` to use it as an accordion header (adds a
 * chevron that rotates + goes red when open).
 */
export default function CategoryBand({
  title,
  kicker,
  accent,
  open,
  onToggle,
  panelId,
}: Props) {
  const shadow = accent === "navy" ? "shadow-pop-navy" : "shadow-pop-red";
  const bandClass = `inline-block -rotate-1 border-2 border-ink bg-ink px-5 py-2 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl ${shadow}`;
  const kickerClass =
    "font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70 sm:text-xs";

  if (!onToggle) {
    return (
      <div className="mb-7 mt-14 flex flex-wrap items-end gap-x-4 gap-y-2 first:mt-0">
        <h3 className={bandClass}>{title}</h3>
        <span className={`mb-1.5 ${kickerClass}`}>{kicker}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className="group flex w-full items-center gap-3 text-left sm:gap-4"
    >
      <span className={bandClass}>{title}</span>
      <span className={`mb-1.5 hidden sm:inline ${kickerClass}`}>{kicker}</span>
      <span
        className={`ml-auto grid size-10 shrink-0 place-items-center border-2 border-ink shadow-pop-sm transition-[transform,background-color] duration-300 group-hover:-translate-y-0.5 ${
          open ? "rotate-180 bg-red text-paper" : "bg-paper text-ink"
        }`}
      >
        <ChevronDown strokeWidth={3} className="size-5" />
      </span>
    </button>
  );
}
