type Props = {
  title: string;
  kicker: string;
  accent: "navy" | "red";
};

/**
 * Category header on an ink "tape" slab with a colored offset shadow, plus a
 * typewriter kicker beside it.
 */
export default function CategoryBand({ title, kicker, accent }: Props) {
  const shadow = accent === "navy" ? "shadow-pop-navy" : "shadow-pop-red";
  return (
    <div className="mb-7 mt-14 flex flex-wrap items-end gap-x-4 gap-y-2 first:mt-0">
      <h3
        className={`inline-block -rotate-1 border-2 border-ink bg-ink px-5 py-2 font-display text-4xl uppercase tracking-wide text-paper sm:text-5xl ${shadow}`}
      >
        {title}
      </h3>
      <span className="mb-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70 sm:text-xs">
        {kicker}
      </span>
    </div>
  );
}
