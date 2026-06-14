"use client";

import { useEffect } from "react";
import type { Product } from "@/data/menu";
import ProductInfo from "./ProductInfo";

type Props = {
  product: Product | null;
  onClose: () => void;
};

/** Merkezi modal — ürün bilgisi. Dışarı dokun ya da Esc ile kapanır. */
export default function ProductInfoOverlay({ product, onClose }: Props) {
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

  const wide = !!product.glassType;

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
        className={`relative z-10 m-auto w-[calc(100%-2rem)] ${
          wide ? "max-w-lg" : "max-w-md"
        }`}
      >
        <div className="relative max-h-[90vh] animate-[popUp_.24s_ease-out] overflow-y-auto border-2 border-ink bg-paper p-5 shadow-pop-lg">
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
