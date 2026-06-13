import { listCategories } from "@/lib/menu-repo";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import ConfirmDelete from "@/components/admin/ConfirmDelete";

export const dynamic = "force-dynamic";

const inp =
  "w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm";
const lbl =
  "mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60";

function Fields({
  c,
}: {
  c?: {
    title: string;
    kicker: string;
    accent: "navy" | "red";
    infoStyle: "modal" | "sheet" | "inline";
    note: string | null;
  };
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Başlık</label>
          <input name="title" defaultValue={c?.title ?? ""} required className={inp} />
        </div>
        <div>
          <label className={lbl}>Alt başlık (kicker)</label>
          <input name="kicker" defaultValue={c?.kicker ?? ""} className={inp} />
        </div>
        <div>
          <label className={lbl}>Vurgu rengi</label>
          <select name="accent" defaultValue={c?.accent ?? "navy"} className={inp}>
            <option value="navy">Mavi</option>
            <option value="red">Kırmızı</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Bilgi kutusu stili</label>
          <select
            name="infoStyle"
            defaultValue={c?.infoStyle ?? "modal"}
            className={inp}
          >
            <option value="modal">Modal</option>
            <option value="sheet">Sheet (alttan)</option>
            <option value="inline">Inline (kart içi)</option>
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className={lbl}>Not (ops. — ör. kahve özelleştirme)</label>
        <input name="note" defaultValue={c?.note ?? ""} className={inp} />
      </div>
    </>
  );
}

export default function CategoriesPage() {
  const cats = listCategories();
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl uppercase leading-none text-ink">
          Kategoriler
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
          {cats.length} kategori
        </p>
      </div>

      {/* yeni kategori */}
      <form
        action={createCategoryAction}
        className="grid gap-3 border-2 border-ink bg-paper p-5 shadow-pop"
      >
        <h2 className="font-display text-2xl uppercase text-red">
          + Yeni kategori
        </h2>
        <Fields />
        <div>
          <button className="border-2 border-ink bg-navy px-5 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
            Ekle
          </button>
        </div>
      </form>

      {/* mevcut kategoriler */}
      <div className="grid gap-5">
        {cats.map((c) => (
          <form
            key={c.id}
            action={updateCategoryAction.bind(null, c.id)}
            className="grid gap-3 border-2 border-ink bg-paper p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl uppercase text-navy">
                {c.title}
              </h3>
              <code className="font-mono text-[10px] text-ink/40">/{c.slug}</code>
            </div>
            <Fields c={c} />
            <div className="flex gap-3">
              <button className="border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5">
                Kaydet
              </button>
              <ConfirmDelete
                action={deleteCategoryAction.bind(null, c.id)}
                message={`"${c.title}" ve içindeki TÜM ürünler silinsin mi?`}
                label="Kategoriyi sil"
              />
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
