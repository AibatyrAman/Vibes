"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteProductAction,
  moveProductAction,
  quickUpdateAction,
} from "@/app/admin/actions";
import type { AdminProduct } from "@/lib/menu-repo";

export default function ProductTable({
  products,
}: {
  products: AdminProduct[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  const num = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isNaN(n) ? null : n;
  };

  return (
    <div
      className={`overflow-x-auto border-2 border-ink shadow-pop transition-opacity ${
        pending ? "opacity-60" : ""
      }`}
    >
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="bg-ink font-mono text-[11px] uppercase tracking-widest text-paper">
            <th className="px-2 py-2 w-12 text-center">Sıra</th>
            <th className="px-3 py-2">Ürün</th>
            <th className="px-3 py-2 w-28">Fiyat ₺</th>
            <th className="px-3 py-2 w-28">İndirimli ₺</th>
            <th className="px-3 py-2 text-center">İnd.</th>
            <th className="px-3 py-2 text-center">Yeni</th>
            <th className="px-3 py-2 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="font-mono text-sm">
          {products.map((p, i) => {
            const showCat =
              i === 0 || products[i - 1].categoryTitle !== p.categoryTitle;
            const isVariant = !!p.variants?.length;
            const firstInCat =
              i === 0 || products[i - 1].categoryId !== p.categoryId;
            const lastInCat =
              i === products.length - 1 ||
              products[i + 1].categoryId !== p.categoryId;
            return (
              <tr key={p.id} className="border-t-2 border-ink/10 align-middle">
                <td className="px-2 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      aria-label="Yukarı taşı"
                      disabled={firstInCat || pending}
                      onClick={() => run(() => moveProductAction(p.id, -1))}
                      className="grid size-6 place-items-center border-2 border-ink bg-paper text-xs leading-none transition-transform hover:-translate-y-px disabled:opacity-25"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Aşağı taşı"
                      disabled={lastInCat || pending}
                      onClick={() => run(() => moveProductAction(p.id, 1))}
                      className="grid size-6 place-items-center border-2 border-ink bg-paper text-xs leading-none transition-transform hover:translate-y-px disabled:opacity-25"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2">
                  {showCat && (
                    <div className="mb-1 font-display text-lg uppercase leading-none text-red">
                      {p.categoryTitle}
                    </div>
                  )}
                  <span className="font-semibold text-navy">{p.name}</span>
                  {p.subGroup && (
                    <span className="ml-2 text-xs text-ink/40">
                      / {p.subGroup}
                    </span>
                  )}
                </td>

                <td className="px-3 py-2">
                  {isVariant ? (
                    <span className="text-xs text-ink/50">varyantlı</span>
                  ) : (
                    <input
                      type="number"
                      step="1"
                      defaultValue={p.price}
                      onBlur={(e) => {
                        const v = num(e.target.value);
                        if (v != null && v !== p.price)
                          run(() => quickUpdateAction(p.id, { price: v }));
                      }}
                      className="w-20 border-2 border-ink bg-white px-2 py-1 outline-none focus:shadow-pop-sm"
                    />
                  )}
                </td>

                <td className="px-3 py-2">
                  <input
                    type="number"
                    step="1"
                    defaultValue={p.salePrice ?? ""}
                    placeholder="—"
                    disabled={isVariant}
                    onBlur={(e) => {
                      const v = e.target.value === "" ? null : num(e.target.value);
                      if (v !== p.salePrice)
                        run(() => quickUpdateAction(p.id, { salePrice: v }));
                    }}
                    className="w-20 border-2 border-ink bg-white px-2 py-1 outline-none focus:shadow-pop-sm disabled:bg-ink/5"
                  />
                </td>

                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    defaultChecked={p.onSale}
                    onChange={(e) =>
                      run(() =>
                        quickUpdateAction(p.id, { onSale: e.target.checked }),
                      )
                    }
                    className="size-5 accent-[#db1010]"
                  />
                </td>

                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    defaultChecked={p.isNew}
                    onChange={(e) =>
                      run(() =>
                        quickUpdateAction(p.id, { isNew: e.target.checked }),
                      )
                    }
                    className="size-5 accent-[#1800ad]"
                  />
                </td>

                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="border-2 border-ink bg-paper px-2 py-1 text-xs font-bold uppercase hover:bg-ink hover:text-paper"
                  >
                    Düzenle
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`"${p.name}" silinsin mi?`))
                        run(() => deleteProductAction(p.id));
                    }}
                    className="ml-2 border-2 border-ink bg-red px-2 py-1 text-xs font-bold uppercase text-paper hover:-translate-y-px"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
