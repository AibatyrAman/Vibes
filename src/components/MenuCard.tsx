import type { Product } from "@/data/menu";

type Props = {
  item: Product;
  accent: "navy" | "red";
  /** base tilt so the grid feels hand-pasted */
  rotate?: number;
};

/**
 * One scrapbook menu card: ink border, colored offset shadow, handwritten red
 * price. On hover it lifts and wobbles like a jostled paper scrap.
 * (rotate / translate / transform are separate CSS props in v4, so the base
 * tilt, hover lift and wobble animation all compose without fighting.)
 */
export default function MenuCard({ item, accent, rotate = 0 }: Props) {
  const shadow =
    accent === "navy"
      ? "shadow-pop-navy hover:shadow-pop-navy-lg"
      : "shadow-pop-red hover:shadow-pop-red-lg";

  return (
    <article
      style={{ rotate: `${rotate}deg` }}
      className={`group relative border-2 border-ink bg-paper p-4 transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:animate-wobble ${shadow}`}
    >
      {item.isNew && (
        <span className="absolute -right-3 -top-3 z-10 -rotate-12 border-2 border-ink bg-red px-2 py-0.5 font-hand text-xl font-bold leading-none text-paper shadow-pop-sm">
          Yeni!
        </span>
      )}

      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-2xl uppercase leading-none text-navy sm:text-[1.7rem]">
          {item.name}
        </h4>
        <span className="shrink-0 font-hand text-3xl font-bold leading-none text-red">
          ₺{item.price}
        </span>
      </div>

      <p className="mt-2 font-mono text-sm leading-snug text-ink/75">
        {item.desc}
      </p>

      {item.tag && (
        <span className="mt-3 inline-block border border-ink bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
          {item.tag} önerisi
        </span>
      )}
    </article>
  );
}
