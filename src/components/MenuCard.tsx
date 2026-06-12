import type { Product } from "@/data/menu";

type Props = {
  item: Product;
  accent: "navy" | "red";
  /** base tilt so the grid feels hand-pasted */
  rotate?: number;
};

function PriceTag({ price }: { price: Product["price"] }) {
  if (Array.isArray(price)) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-0.5 leading-none">
        {price.map((v) => (
          <span
            key={v.label}
            className="whitespace-nowrap font-hand text-2xl font-bold leading-none text-red"
          >
            <span className="mr-1 font-mono text-[9px] font-bold uppercase tracking-wide text-ink/50">
              {v.label}
            </span>
            ₺{v.price}
          </span>
        ))}
      </div>
    );
  }
  return (
    <span className="shrink-0 font-hand text-3xl font-bold leading-none text-red">
      ₺{price}
    </span>
  );
}

/**
 * One scrapbook menu card: ink border, colored offset shadow, handwritten red
 * price (single or variant). On hover it lifts and wobbles like a paper scrap.
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
        <PriceTag price={item.price} />
      </div>

      {item.desc && (
        <p className="mt-2 font-mono text-sm leading-snug text-ink/75">
          {item.desc}
        </p>
      )}

      {item.tag && (
        <span className="mt-3 inline-block border border-ink bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
          {item.tag} önerisi
        </span>
      )}
    </article>
  );
}
