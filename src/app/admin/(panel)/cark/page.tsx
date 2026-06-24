import { listProductsFlat, getSetting } from "@/lib/menu-repo";
import { getWheelSlots, listRecentWins } from "@/lib/wheel-repo";
import {
  createWheelSlotAction,
  deleteWheelSlotAction,
  moveWheelSlotAction,
  setWheelEnabledAction,
  updateWheelSlotAction,
} from "@/app/admin/wheel-actions";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import WheelToggle from "@/components/admin/WheelToggle";
import RedeemPrizeForm from "@/components/admin/RedeemPrizeForm";
import MoveButtons from "@/components/admin/MoveButtons";
import SpinGateQr from "@/components/admin/SpinGateQr";

export const dynamic = "force-dynamic";

const inp =
  "w-full border-2 border-ink bg-white px-3 py-2 font-mono text-sm outline-none focus:shadow-pop-sm";
const lbl =
  "mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60";

function SlotFields({
  slot,
  products,
}: {
  slot?: {
    productId: number | null;
    label: string;
    rewardNote: string | null;
    color: string;
    weight: number;
    angle: number;
  };
  products: ReturnType<typeof listProductsFlat>;
}) {
  const byCat: Record<string, typeof products> = {};
  for (const p of products) (byCat[p.categoryTitle] ??= []).push(p);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={lbl}>Etiket (çarkta görünen)</label>
        <input
          name="label"
          defaultValue={slot?.label ?? ""}
          required
          placeholder="ör. Bedava Espresso"
          className={inp}
        />
      </div>
      <div>
        <label className={lbl}>Ürün (ops. — boş = &quot;Bir dahaki sefere&quot;)</label>
        <select name="productId" defaultValue={slot?.productId ?? ""} className={inp}>
          <option value="">— Ürün yok (boş slot)</option>
          {Object.entries(byCat).map(([cat, ps]) => (
            <optgroup key={cat} label={cat}>
              {ps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className={lbl}>Ödül notu (ops. — garsona görünür)</label>
        <input
          name="rewardNote"
          defaultValue={slot?.rewardNote ?? ""}
          placeholder="ör. 1 adet, masada geçerli"
          className={inp}
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className={lbl}>Renk</label>
          <input
            name="color"
            type="color"
            defaultValue={slot?.color ?? "#db1010"}
            className="h-10 w-full cursor-pointer border-2 border-ink bg-white"
          />
        </div>
        <div className="flex-1">
          <label className={lbl}>Ağırlık (şans — yüksek = sık çıkar)</label>
          <input
            name="weight"
            type="number"
            min={1}
            defaultValue={slot?.weight ?? 1}
            className={inp}
          />
        </div>
        <div className="flex-1">
          <label className={lbl}>Görsel açı (dar/geniş dilim)</label>
          <input
            name="angle"
            type="number"
            min={0.1}
            step={0.1}
            defaultValue={slot?.angle ?? 1}
            className={inp}
          />
        </div>
      </div>
      <p className="-mt-1 font-mono text-[10px] text-ink/40">
        Ağırlık şansı belirler, görsel açı sadece çarktaki dilim genişliğini
        değiştirir — şanstan bağımsızdır (ör. ağırlığı düşük ama dilimi geniş
        bir slot yapılabilir).
      </p>
    </div>
  );
}

export default function WheelAdminPage() {
  const products = listProductsFlat();
  const slots = getWheelSlots();
  const enabled = getSetting("wheel_enabled", "1") === "1";
  const wins = listRecentWins();

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl uppercase leading-none text-ink">
          Çarkı Felek
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
          {slots.length} slot · sadece alkol alan müşteri çevirebilir
        </p>
      </div>

      <WheelToggle enabled={enabled} action={setWheelEnabledAction} />

      <SpinGateQr />

      {/* yeni slot */}
      <form
        action={createWheelSlotAction}
        className="grid gap-3 border-2 border-ink bg-paper p-5 shadow-pop"
      >
        <h2 className="font-display text-2xl uppercase text-red">+ Yeni slot</h2>
        <SlotFields products={products} />
        <div>
          <button className="border-2 border-ink bg-navy px-5 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5">
            Ekle
          </button>
        </div>
      </form>

      {/* mevcut slotlar */}
      <div className="grid gap-4">
        {slots.map((s, i) => (
          <div key={s.id} className="border-2 border-ink bg-paper p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MoveButtons
                  id={s.id}
                  index={i}
                  count={slots.length}
                  action={moveWheelSlotAction}
                />
                <h3 className="font-display text-xl uppercase text-navy">
                  {s.label}
                </h3>
              </div>
              <span
                className="size-6 border-2 border-ink"
                style={{ backgroundColor: s.color }}
              />
            </div>
            <form
              action={updateWheelSlotAction.bind(null, s.id)}
              className="grid gap-3"
            >
              <SlotFields slot={s} products={products} />
              <div className="flex gap-3">
                <button className="border-2 border-ink bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5">
                  Kaydet
                </button>
                <ConfirmDelete
                  action={deleteWheelSlotAction.bind(null, s.id)}
                  message={`"${s.label}" slotu silinsin mi?`}
                  label="Slotu sil"
                />
              </div>
            </form>
          </div>
        ))}
        {slots.length === 0 && (
          <p className="font-mono text-sm text-ink/50">
            Henüz slot yok. Yukarıdan ekleyin.
          </p>
        )}
      </div>

      {/* ödül kodu doğrula */}
      <div>
        <h2 className="mb-3 font-display text-3xl uppercase text-red">
          Ödül kodu doğrula
        </h2>
        <RedeemPrizeForm />
      </div>

      {/* son kazananlar */}
      <div>
        <h2 className="mb-3 font-display text-3xl uppercase text-navy">
          Son kazananlar
        </h2>
        {wins.length === 0 ? (
          <p className="font-mono text-sm text-ink/50">Henüz kazanan yok.</p>
        ) : (
          <div className="overflow-x-auto border-2 border-ink shadow-pop">
            <table className="w-full min-w-[600px] border-collapse text-left font-mono text-sm">
              <thead>
                <tr className="bg-ink text-[11px] uppercase tracking-widest text-paper">
                  <th className="px-3 py-2">Müşteri</th>
                  <th className="px-3 py-2">Ödül</th>
                  <th className="px-3 py-2">Kod</th>
                  <th className="px-3 py-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {wins.map((w) => (
                  <tr key={w.id} className="border-t-2 border-ink/10">
                    <td className="px-3 py-2 font-bold text-navy">
                      {w.customerUsername}
                    </td>
                    <td className="px-3 py-2">{w.label}</td>
                    <td className="px-3 py-2">{w.prizeCode}</td>
                    <td className="px-3 py-2">
                      {w.redeemed ? (
                        <span className="text-ink/40">Kullanıldı</span>
                      ) : (
                        <span className="font-bold text-red">Bekliyor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
