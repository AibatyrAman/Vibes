"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { DrinkLayer, Garnish, GlassType } from "@/data/menu";
import { GLASS_LABELS, GLASSES } from "@/components/anatomy/glasses";
import { GARNISH_LABELS } from "@/components/anatomy/garnishes";

const inp =
  "w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm";
const lbl =
  "mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60";

const GLASS_KEYS = Object.keys(GLASSES) as GlassType[];
const GARNISH_KEYS = Object.keys(GARNISH_LABELS) as Garnish[];

export default function AnatomyFields({
  glassType,
  layers: initLayers,
  garnishes,
  photo,
}: {
  glassType?: GlassType | null;
  layers?: DrinkLayer[];
  garnishes?: Garnish[];
  photo?: string | null;
}) {
  const [layers, setLayers] = useState<DrinkLayer[]>(initLayers ?? []);

  const update = (i: number, patch: Partial<DrinkLayer>) =>
    setLayers((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const remove = (i: number) =>
    setLayers((ls) => ls.filter((_, j) => j !== i));
  const add = () =>
    setLayers((ls) => [...ls, { name: "", percent: 0, color: "#db1010" }]);

  const total = layers.reduce((s, l) => s + (Number(l.percent) || 0), 0);

  return (
    <div className="grid gap-4 border-2 border-dashed border-ink/30 bg-paper-dim/40 p-4">
      <p className="font-display text-2xl uppercase leading-none text-navy">
        İçecek Anatomisi
      </p>
      <p className="-mt-2 font-mono text-[11px] text-ink/50">
        Bardak tipi seçilirse bilgi kutusunda interaktif çizim gösterilir.
        Boş bırakılırsa anatomi görünmez.
      </p>

      {/* bardak tipi */}
      <div className="sm:max-w-xs">
        <label className={lbl}>Bardak tipi</label>
        <select name="glassType" defaultValue={glassType ?? ""} className={inp}>
          <option value="">— Yok (anatomi gösterme)</option>
          {GLASS_KEYS.map((g) => (
            <option key={g} value={g}>
              {GLASS_LABELS[g]}
            </option>
          ))}
        </select>
      </div>

      {/* katmanlar (repeater) */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={lbl + " mb-0"}>Malzeme katmanları (alttan üste)</label>
          <span
            className={`font-mono text-xs font-bold ${
              total > 100 ? "text-red" : "text-ink/50"
            }`}
          >
            Toplam %{total}
            {total > 100 && " (100'ü aştı)"}
          </span>
        </div>

        <div className="grid gap-2">
          {layers.map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-2 border-ink bg-white p-2"
            >
              <input
                aria-label="Renk"
                type="color"
                value={l.color}
                onChange={(e) => update(i, { color: e.target.value })}
                className="size-9 shrink-0 cursor-pointer border-2 border-ink bg-white"
              />
              <input
                aria-label="Malzeme adı"
                value={l.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Malzeme (ör. Tekila)"
                className="min-w-0 flex-1 border-2 border-ink bg-white px-2 py-1.5 font-mono text-sm outline-none"
              />
              <div className="flex shrink-0 items-center gap-1">
                <input
                  aria-label="Yüzde"
                  type="number"
                  min={0}
                  max={100}
                  value={l.percent}
                  onChange={(e) =>
                    update(i, { percent: Number(e.target.value) })
                  }
                  className="w-16 border-2 border-ink bg-white px-2 py-1.5 font-mono text-sm outline-none"
                />
                <span className="font-mono text-sm text-ink/50">%</span>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Katmanı kaldır"
                className="grid size-8 shrink-0 place-items-center border-2 border-ink bg-red text-paper transition-transform hover:rotate-90"
              >
                <X strokeWidth={3} className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="mt-2 inline-flex items-center gap-1.5 border-2 border-ink bg-navy px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5"
        >
          <Plus strokeWidth={3} className="size-4" />
          Katman ekle
        </button>

        <input type="hidden" name="layers" value={JSON.stringify(layers)} />
      </div>

      {/* jestler */}
      <div>
        <label className={lbl}>Jestler / Süslemeler</label>
        <div className="flex flex-wrap gap-2.5">
          {GARNISH_KEYS.map((g) => (
            <label
              key={g}
              className="flex items-center gap-1.5 border-2 border-ink bg-white px-2.5 py-1.5 font-mono text-xs"
            >
              <input
                type="checkbox"
                name="garnishes"
                value={g}
                defaultChecked={garnishes?.includes(g)}
                className="accent-[#1800ad]"
              />
              {GARNISH_LABELS[g]}
            </label>
          ))}
        </div>
      </div>

      {/* gerçek foto */}
      <div>
        <label className={lbl}>Gerçek fotoğraf (PNG / WEBP / JPG, dekupe)</label>
        {photo && (
          <div className="mb-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/media/${photo}`}
              alt="Mevcut fotoğraf"
              className="size-16 border-2 border-ink object-contain"
            />
            <label className="flex items-center gap-1.5 font-mono text-xs text-ink/70">
              <input
                type="checkbox"
                name="removePhoto"
                value="1"
                className="accent-[#db1010]"
              />
              Fotoğrafı kaldır
            </label>
            <input type="hidden" name="photoExisting" value={photo} />
          </div>
        )}
        <input
          type="file"
          name="photo"
          accept="image/png,image/webp,image/jpeg"
          className="block w-full font-mono text-xs file:mr-3 file:border-2 file:border-ink file:bg-navy file:px-3 file:py-1.5 file:font-mono file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-paper"
        />
      </div>
    </div>
  );
}
