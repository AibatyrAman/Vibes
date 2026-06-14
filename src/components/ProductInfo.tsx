"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/data/menu";
import AllergenIcons from "./scrap/AllergenIcons";
import DrinkAnatomy from "./anatomy/DrinkAnatomy";

function PriceBlock({ product }: { product: Product }) {
  if (Array.isArray(product.price)) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {product.price.map((v) => (
          <span
            key={v.label}
            className="whitespace-nowrap font-hand text-2xl font-bold leading-none text-red"
          >
            <span className="mr-1 font-mono text-[9px] font-bold uppercase text-ink/50">
              {v.label}
            </span>
            ₺{v.price}
          </span>
        ))}
      </div>
    );
  }
  if (product.onSale && product.salePrice != null) {
    return (
      <div className="flex shrink-0 flex-col items-end leading-none">
        <span className="font-mono text-base text-ink/40 line-through">
          ₺{product.price}
        </span>
        <span className="font-hand text-4xl font-bold leading-none text-red">
          ₺{product.salePrice}
        </span>
      </div>
    );
  }
  return (
    <span className="shrink-0 font-hand text-4xl font-bold leading-none text-red">
      ₺{product.price}
    </span>
  );
}

/** Bilgi kutusu içeriği — modal / sheet / inline hepsi bunu kullanır. */
export default function ProductInfo({ product }: { product: Product }) {
  const [storyOpen, setStoryOpen] = useState(false);
  const ingredients =
    product.ingredients ?? (product.desc ? [product.desc] : []);
  const hasMeta =
    (product.allergens?.length ?? 0) > 0 ||
    product.abv != null ||
    product.kcal != null;

  return (
    <div>
      {/* başlık */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-3xl uppercase leading-none text-navy">
            {product.name}
          </h3>
          {(product.isNew || product.tag) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.isNew && (
                <span className="-rotate-3 border-2 border-ink bg-red px-2 font-hand text-lg font-bold leading-tight text-paper shadow-pop-sm">
                  Yeni!
                </span>
              )}
              {product.tag && (
                <span className="border border-ink bg-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-paper">
                  {product.tag} önerisi
                </span>
              )}
            </div>
          )}
        </div>
        <PriceBlock product={product} />
      </div>

      {/* içecek anatomisi — line-art bardak + dolum + flip */}
      {product.glassType && <DrinkAnatomy product={product} />}

      {/* içindekiler — ilk ve belirgin */}
      {ingredients.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
            İçindekiler
          </p>
          <ul className="mt-1.5 flex flex-wrap font-mono text-sm text-ink/80">
            {ingredients.map((x, i) => (
              <li
                key={i}
                className="after:mx-2 after:text-red after:content-['·'] last:after:content-['']"
              >
                {x}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* alerjenler + abv/kcal (küçük) */}
      {hasMeta && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <AllergenIcons allergens={product.allergens} />
          {(product.abv != null || product.kcal != null) && (
            <span className="font-mono text-xs text-ink/60">
              {product.abv != null && <>Alkol %{product.abv}</>}
              {product.abv != null && product.kcal != null && " · "}
              {product.kcal != null && <>{product.kcal} kcal</>}
            </span>
          )}
        </div>
      )}

      {/* hikâye — basınca açılır */}
      {product.story && (
        <div className="mt-5 border-t-2 border-dashed border-ink/20 pt-3">
          <button
            type="button"
            onClick={() => setStoryOpen((o) => !o)}
            aria-expanded={storyOpen}
            className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-widest text-red"
          >
            <ChevronRight
              strokeWidth={3}
              className={`size-4 transition-transform duration-200 ${
                storyOpen ? "rotate-90" : ""
              }`}
            />
            Hikâye
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              storyOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="pt-2 font-hand text-xl leading-snug text-ink/80">
                {product.story}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
