"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { AdminCampaign, AdminProduct } from "@/lib/menu-repo";

type Item = { productId: number; quantity: number; productName: string };

const inp =
  "w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm";
const lbl =
  "mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60";

export default function CampaignForm({
  action,
  campaign,
  products,
}: {
  action: (formData: FormData) => void | Promise<void>;
  campaign?: AdminCampaign;
  products: AdminProduct[];
}) {
  const [items, setItems] = useState<Item[]>(campaign?.items ?? []);
  const [picked, setPicked] = useState<number>(products[0]?.id ?? 0);
  const [original, setOriginal] = useState(
    campaign?.originalPrice != null ? String(campaign.originalPrice) : "",
  );
  const [price, setPrice] = useState(
    campaign?.price != null ? String(campaign.price) : "",
  );

  const byCat = useMemo(() => {
    const acc: Record<string, AdminProduct[]> = {};
    for (const p of products) (acc[p.categoryTitle] ??= []).push(p);
    return acc;
  }, [products]);

  const add = () => {
    const p = products.find((x) => x.id === picked);
    if (!p) return;
    setItems((prev) =>
      prev.some((i) => i.productId === p.id)
        ? prev
        : [...prev, { productId: p.id, quantity: 1, productName: p.name }],
    );
  };
  const setQty = (id: number, q: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.productId === id ? { ...i, quantity: Math.max(1, q) } : i,
      ),
    );
  const remove = (id: number) =>
    setItems((prev) => prev.filter((i) => i.productId !== id));

  const o = Number(original);
  const pr = Number(price);
  const pct = o > 0 && pr > 0 && pr < o ? Math.round((1 - pr / o) * 100) : null;

  return (
    <form
      action={action}
      className="grid gap-5 border-2 border-ink bg-paper p-5 shadow-pop sm:p-6"
    >
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map(({ productId, quantity }) => ({ productId, quantity })),
        )}
      />

      <div>
        <label className={lbl}>Kampanya adı</label>
        <input
          name="name"
          defaultValue={campaign?.name ?? ""}
          required
          placeholder="ör. Bira + Tekila Shot"
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Açıklama (ops.)</label>
        <input
          name="description"
          defaultValue={campaign?.description ?? ""}
          className={inp}
        />
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-3">
        <div>
          <label className={lbl}>Normal fiyat ₺ (üstü çizili)</label>
          <input
            name="originalPrice"
            type="number"
            step="1"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="450"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Kampanya fiyatı ₺</label>
          <input
            name="price"
            type="number"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="400"
            required
            className={inp}
          />
        </div>
        <div className="pb-2 font-mono text-sm">
          {pct != null ? (
            <span className="border-2 border-ink bg-red px-2 py-1 font-bold uppercase text-paper">
              %{pct} indirim
            </span>
          ) : (
            <span className="text-ink/40">indirim önizleme</span>
          )}
        </div>
      </div>

      {/* ürün seçici */}
      <div className="border-2 border-dashed border-ink/30 p-4">
        <label className={lbl}>Kampanyadaki ürünler</label>
        <div className="flex flex-wrap gap-2">
          <select
            value={picked}
            onChange={(e) => setPicked(Number(e.target.value))}
            className={`${inp} max-w-xs`}
          >
            {Object.entries(byCat).map(([cat, ps]) => (
              <optgroup key={cat} label={cat}>
                {ps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₺{p.price}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={add}
            className="border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5"
          >
            + Ekle
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-3 font-mono text-xs text-ink/40">
            Henüz ürün eklenmedi. Tek üründen 6 adet için: ürünü ekle, adedi 6 yap.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {items.map((i) => (
              <li
                key={i.productId}
                className="flex items-center gap-3 border-2 border-ink bg-white px-3 py-2"
              >
                <span className="flex-1 font-mono text-sm font-bold text-navy">
                  {i.productName}
                </span>
                <label className="flex items-center gap-1.5 font-mono text-xs uppercase text-ink/60">
                  adet
                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) =>
                      setQty(i.productId, Number(e.target.value))
                    }
                    className="w-16 border-2 border-ink px-2 py-1 text-center outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => remove(i.productId)}
                  aria-label="Kaldır"
                  className="grid size-7 place-items-center border-2 border-ink bg-red text-paper hover:rotate-90"
                >
                  <X strokeWidth={3} className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="flex items-center gap-2 font-mono text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={campaign?.active ?? true}
          className="size-5 accent-[#db1010]"
        />
        Aktif (menüde göster)
      </label>

      <div className="flex flex-wrap gap-3 border-t-2 border-ink/10 pt-5">
        <button className="border-2 border-ink bg-navy px-6 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
          Kaydet
        </button>
        <Link
          href="/admin/campaigns"
          className="border-2 border-ink bg-paper px-6 py-3 font-display text-xl uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
