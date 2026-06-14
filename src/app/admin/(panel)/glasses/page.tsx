import { getGlassCavities } from "@/lib/menu-repo";
import GlassCalibrator from "@/components/admin/GlassCalibrator";

export const dynamic = "force-dynamic";

export default function GlassesPage() {
  const overrides = getGlassCavities();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 font-display text-4xl uppercase leading-none text-ink">
        Bardak Kalibrasyon
      </h1>
      <p className="mb-6 font-mono text-xs text-ink/60">
        Her bardağın sıvı dolum bölgesini noktaları sürükleyerek ayarla.
        Değişiklik o bardağı kullanan tüm menü ürünlerine uygulanır.
      </p>
      <GlassCalibrator overrides={overrides} />
    </div>
  );
}
