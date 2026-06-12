"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Product } from "@/data/menu";
import ProductInfo from "./ProductInfo";

type Props = {
  product: Product | null;
  variant: "modal" | "sheet";
  onClose: () => void;
};

/** Modal (merkez) ve sheet (mobilde alttan) sunumlarını kapsar. */
export default function ProductInfoOverlay({ product, variant, onClose }: Props) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;
  const isSheet = variant === "sheet";

  return (
    <div
      className="fixed inset-0 z-[95] flex"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} bilgisi`}
    >
      <button
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 animate-[fadeIn_.2s_ease-out] bg-ink/60"
      />

      <div
        className={
          isSheet
            ? "relative z-10 mt-auto w-full sm:m-auto sm:max-w-md sm:px-4"
            : "relative z-10 m-auto w-[calc(100%-2rem)] max-w-md"
        }
      >
        <div
          className={`relative border-2 border-ink bg-paper p-5 shadow-pop-lg ${
            isSheet
              ? "animate-[sheetUp_.28s_ease-out] sm:animate-[popUp_.24s_ease-out]"
              : "animate-[popUp_.24s_ease-out]"
          }`}
        >
          {isSheet && (
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/30 sm:hidden" />
          )}
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute right-3 top-3 grid size-8 place-items-center border-2 border-ink bg-red text-paper shadow-pop-sm transition-transform hover:rotate-90"
          >
            <X strokeWidth={3} className="size-4" />
          </button>
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
