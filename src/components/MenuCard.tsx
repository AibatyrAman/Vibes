"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import type { Product } from "@/data/menu";
import ProductInfo from "./ProductInfo";

type Props = {
  item: Product;
  accent: "navy" | "red";
  rotate?: number;
  infoStyle?: "modal" | "sheet" | "inline";
  onOpen?: (product: Product, variant: "modal" | "sheet") => void;
};

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
 * Scrapbook menu card. Hover wobbles (desktop). Tap opens product info:
 * modal/sheet lift to the overlay; inline expands within the card.
 */
export default function MenuCard({
  item,
  accent,
  rotate = 0,
  infoStyle = "modal",
  onOpen,
}: Props) {
  const [inlineOpen, setInlineOpen] = useState(false);
  const isInline = infoStyle === "inline";

  const shadow =
    accent === "navy"
      ? "shadow-pop-navy hover:shadow-pop-navy-lg"
      : "shadow-pop-red hover:shadow-pop-red-lg";

  const activate = () => {
    if (isInline) setInlineOpen((o) => !o);
    else onOpen?.(item, infoStyle as "modal" | "sheet");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      activate();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={onKeyDown}
      aria-expanded={isInline ? inlineOpen : undefined}
      style={{ rotate: `${rotate}deg` }}
      className={`group relative cursor-pointer border-2 border-ink bg-paper p-4 pb-5 transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:animate-wobble ${shadow}`}
    >
      {item.isNew && (
        <span className="absolute -right-3 -top-3 z-10 -rotate-12 border-2 border-ink bg-red px-2 py-0.5 font-hand text-xl font-bold leading-none text-paper shadow-pop-sm">
          Yeni!
        </span>
      )}
      {item.onSale && (
        <span className="absolute -left-3 -top-3 z-10 -rotate-6 rounded-full border-[2px] border-ink bg-paper px-3 py-1.5 font-display text-[13px] font-bold uppercase leading-none tracking-[0.18em] text-red shadow-pop-sm">
          İndirimli
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

      {item.tag && (
        <span className="mt-3 inline-block border border-ink bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
          {item.tag} önerisi
        </span>
      )}

      {/* subtle "tap for detail" hint */}
      <span
        aria-hidden
        className={`absolute bottom-1.5 right-2 grid size-5 place-items-center text-ink/30 transition-[transform,color] duration-200 group-hover:text-red ${
          isInline && inlineOpen ? "rotate-45 text-red" : ""
        }`}
      >
        <Plus strokeWidth={3} className="size-4" />
      </span>

      {/* inline info (only for inline style) */}
      {isInline && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            inlineOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 cursor-default border-t-2 border-dashed border-ink/20 pt-4">
              <ProductInfo product={item} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
