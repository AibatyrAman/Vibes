import Link from "next/link";
import type { Allergen } from "@/data/menu";
import type { AdminCategory, AdminProduct } from "@/lib/menu-repo";
import AnatomyFields from "./AnatomyFields";

const ALLERGENS: Allergen[] = ["süt", "gluten", "fındık", "yumurta", "soya"];
const inp =
  "w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm";
const lbl =
  "mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60";

export default function ProductForm({
  action,
  product,
  categories,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: AdminProduct;
  categories: AdminCategory[];
}) {
  const variantsText =
    product?.variants?.map((v) => `${v.label} | ${v.price}`).join("\n") ?? "";

  return (
    <form
      action={action}
      encType="multipart/form-data"
      className="grid gap-5 border-2 border-ink bg-paper p-5 shadow-pop sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>İsim</label>
          <input name="name" defaultValue={product?.name ?? ""} required className={inp} />
        </div>
        <div>
          <label className={lbl}>Kategori</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId ?? categories[0]?.id}
            className={inp}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={lbl}>Kısa açıklama (kart satırı)</label>
        <input
          name="description"
          defaultValue={product?.description ?? ""}
          className={inp}
        />
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-3">
        <div>
          <label className={lbl}>Fiyat ₺</label>
          <input
            name="price"
            type="number"
            step="1"
            defaultValue={product?.price ?? ""}
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>İndirimli ₺ (ops.)</label>
          <input
            name="salePrice"
            type="number"
            step="1"
            defaultValue={product?.salePrice ?? ""}
            className={inp}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 font-mono text-sm">
          <input
            type="checkbox"
            name="onSale"
            defaultChecked={product?.onSale}
            className="size-5 accent-[#db1010]"
          />
          İndirimde
        </label>
      </div>

      <div>
        <label className={lbl}>
          Varyantlı fiyat (ops.) — her satır: Etiket | Fiyat
        </label>
        <textarea
          name="variants"
          rows={2}
          defaultValue={variantsText}
          placeholder={"Tek | 90\nDouble | 120"}
          className={inp}
        />
        <p className="mt-1 font-mono text-[10px] text-ink/40">
          Doluysa tek fiyat yerine varyantlar gösterilir (ör. Espresso
          Tek/Double, şarap Kadeh/Şişe).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Alt grup (ops. — ör. Gin, Viski)</label>
          <input name="subGroup" defaultValue={product?.subGroup ?? ""} className={inp} />
        </div>
        <div>
          <label className={lbl}>Etiket (ops. — ör. Şef)</label>
          <input name="tag" defaultValue={product?.tag ?? ""} className={inp} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Alkol oranı % (ops.)</label>
          <input
            name="abv"
            type="number"
            step="0.1"
            defaultValue={product?.abv ?? ""}
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Kalori (ops.)</label>
          <input
            name="kcal"
            type="number"
            step="1"
            defaultValue={product?.kcal ?? ""}
            className={inp}
          />
        </div>
      </div>

      <div>
        <label className={lbl}>İçindekiler (virgül veya satırla ayır)</label>
        <textarea
          name="ingredients"
          rows={2}
          defaultValue={product?.ingredients.join(", ") ?? ""}
          className={inp}
        />
      </div>

      <div>
        <label className={lbl}>Alerjenler</label>
        <div className="flex flex-wrap gap-2.5">
          {ALLERGENS.map((a) => (
            <label
              key={a}
              className="flex items-center gap-1.5 border-2 border-ink bg-white px-2.5 py-1.5 font-mono text-xs uppercase"
            >
              <input
                type="checkbox"
                name="allergens"
                value={a}
                defaultChecked={product?.allergens.includes(a)}
                className="accent-[#db1010]"
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={lbl}>
          Hikâye (ops. — bilgi kutusunda “Hikâye” ile açılır)
        </label>
        <textarea
          name="story"
          rows={3}
          defaultValue={product?.story ?? ""}
          className={inp}
        />
      </div>

      <label className="flex items-center gap-2 font-mono text-sm">
        <input
          type="checkbox"
          name="isNew"
          defaultChecked={product?.isNew}
          className="size-5 accent-[#1800ad]"
        />
        “Yeni” rozeti göster
      </label>

      <AnatomyFields
        glassType={product?.glassType ?? null}
        layers={product?.layers}
        photo={product?.photo ?? null}
      />

      <div className="flex flex-wrap gap-3 border-t-2 border-ink/10 pt-5">
        <button className="border-2 border-ink bg-navy px-6 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
          Kaydet
        </button>
        <Link
          href="/admin"
          className="border-2 border-ink bg-paper px-6 py-3 font-display text-xl uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
