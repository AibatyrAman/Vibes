"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Category, Product } from "@/data/menu";
import MenuAccordion from "./MenuAccordion";
import ProductInfoOverlay from "./ProductInfoOverlay";

function matches(p: Product, q: string) {
  return (
    p.name.toLowerCase().includes(q) ||
    (p.desc?.toLowerCase().includes(q) ?? false) ||
    (p.ingredients?.some((i) => i.toLowerCase().includes(q)) ?? false)
  );
}

export default function MenuSection({ menu }: { menu: Category[] }) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(menu.filter((c) => c.defaultOpen).map((c) => c.id)),
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const q = query.trim().toLowerCase();
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Category[]>(() => {
    if (!q) return menu;
    return menu.flatMap((c) => {
      if (c.title.toLowerCase().includes(q)) return [c];
      const items = c.items?.filter((p) => matches(p, q));
      const groups = c.groups
        ?.map((g) => ({ ...g, items: g.items.filter((p) => matches(p, q)) }))
        .filter((g) => g.items.length > 0);
      const has = (items?.length ?? 0) > 0 || (groups?.length ?? 0) > 0;
      return has ? [{ ...c, items, groups }] : [];
    });
  }, [q, menu]);

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const onOpenInfo = useCallback((product: Product) => setSelected(product), []);

  // Mobile "active card on the centre line" wobble — touch devices only.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: hover)").matches) return; // desktop keeps hover
    const root = listRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          e.target.classList.toggle("on-line", e.isIntersecting);
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    root.querySelectorAll("[data-card]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [open, q]);

  return (
    <section
      id="menu"
      className="scroll-mt-16 border-b-4 border-ink bg-paper py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-6 -rotate-1">
          <h2 className="font-display text-6xl uppercase leading-none text-ink sm:text-7xl">
            Menü
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
            Kategoriye dokun · ürüne dokun · keşfet
          </p>
        </div>

        {/* search */}
        <div className="relative mb-4 max-w-md">
          <Search
            strokeWidth={2.5}
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink/50"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara: negroni, espresso, gin…"
            aria-label="Menüde ara"
            className="w-full border-2 border-ink bg-paper py-3 pl-10 pr-10 font-mono text-sm shadow-pop-sm outline-none placeholder:text-ink/40 focus:shadow-pop"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Aramayı temizle"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center border-2 border-ink bg-red text-paper transition-transform hover:rotate-90"
            >
              <X strokeWidth={3} className="size-4" />
            </button>
          )}
        </div>

        {/* accordions */}
        <div ref={listRef}>
          {results.map((c) => (
            <MenuAccordion
              key={c.id}
              category={c}
              open={q ? true : open.has(c.id)}
              onToggle={() => toggle(c.id)}
              onOpenInfo={onOpenInfo}
            />
          ))}
          {q && results.length === 0 && (
            <p className="py-12 text-center font-mono text-sm text-ink/60">
              &quot;{query}&quot; için sonuç yok.
            </p>
          )}
        </div>
      </div>

      <ProductInfoOverlay
        product={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
