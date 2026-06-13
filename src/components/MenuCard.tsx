"use client";

import { type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/data/menu";

type Props = {
  item: Product;
  accent: "navy" | "red";
  rotate?: number;
  onOpen?: (product: Product) => void;
};

function discountPct(item: Product): number | null {
  if (Array.isArray(item.price)) return null;
  if (!item.onSale || item.salePrice == null || item.price <= 0) return null;
  const pct = Math.round((1 - item.salePrice / item.price) * 100);
  return pct > 0 ? pct : null;
}

function PriceTag({ item }: { item: Product }) {
  if (Array.isArray(item.price)) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-0.5 leading-none">
        {item.price.map((v) => (
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
  if (item.onSale && item.salePrice != null) {
    return (
      <div className="flex shrink-0 flex-col items-end leading-none">
        <span className="font-mono text-sm text-ink/40 line-through">
          ₺{item.price}
        </span>
        <span className="font-hand text-3xl font-bold leading-none text-red">
          ₺{item.salePrice}
        </span>
      </div>
    );
  }
  return (
    <span className="shrink-0 font-hand text-3xl font-bold leading-none text-red">
      ₺{item.price}
    </span>
  );
}

/**
 * Scrapbook menu card. Hover wobbles (desktop). Tap opens the product info modal.
 */
export default function MenuCard({ item, accent, rotate = 0, onOpen }: Props) {
  const shadow =
    accent === "navy"
      ? "shadow-pop-navy hover:shadow-pop-navy-lg"
      : "shadow-pop-red hover:shadow-pop-red-lg";
  const pct = discountPct(item);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOpen?.(item);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(item)}
      onKeyDown={onKeyDown}
      style={{ rotate: `${rotate}deg` }}
      className={`group relative cursor-pointer border-2 border-ink bg-paper p-4 pb-5 transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:animate-wobble ${shadow}`}
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
        <PriceTag item={item} />
      </div>

      {item.desc && (
        <p className="mt-2 max-w-[85%] font-mono text-sm leading-snug text-ink/75">
          {item.desc}
        </p>
      )}

      {(pct != null || item.tag) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pr-6">
          {pct != null && (
            <span className="-rotate-2 border-2 border-ink bg-red px-2.5 py-0.5 font-hand text-lg font-bold leading-none text-paper shadow-pop-sm">
              %{pct} indirim
            </span>
          )}
          {item.tag && (
            <span className="border border-ink bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
              {item.tag} önerisi
            </span>
          )}
        </div>
      )}

      {/* subtle "tap for detail" hint */}
      <span
        aria-hidden
        className="absolute bottom-1.5 right-2 grid size-5 place-items-center text-ink/30 transition-colors duration-200 group-hover:text-red"
      >
        <Plus strokeWidth={3} className="size-4" />
      </span>
    </article>
  );
}
