import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import CustomerGate from "@/components/CustomerGate";
import Wheel from "@/components/wheel/Wheel";
import { getCustomerId } from "@/lib/customer-auth";
import { getCustomer } from "@/lib/customer-repo";
import { getSetting } from "@/lib/menu-repo";
import { getPendingPrizes, getWheelSlots } from "@/lib/wheel-repo";
import { isSpinUnlocked } from "@/lib/spin-gate";

export const dynamic = "force-dynamic";

export default async function CarkPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const enabled = getSetting("wheel_enabled", "1") === "1";
  const customerId = await getCustomerId();
  const customer = customerId ? getCustomer(customerId) : null;
  const slots = enabled ? getWheelSlots() : [];
  const unlocked = enabled ? await isSpinUnlocked(customer) : false;
  const pendingPrizes = customer ? getPendingPrizes(customer.id) : [];
  const kapiGecersiz = (await searchParams).kapi === "gecersiz";

  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main className="border-b-4 border-ink bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-5">
          <div className="mb-8 -rotate-1">
            <h1 className="font-display text-6xl uppercase leading-none text-ink sm:text-7xl">
              Çarkı Felek
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              Her içkide 1 çevirme hakkı
            </p>
          </div>

          {!enabled ? (
            <p className="font-mono text-sm text-ink/50">
              Çark şu anda kapalı, az sonra tekrar uğra.
            </p>
          ) : !unlocked ? (
            <div className="grid gap-5">
              <div className="border-2 border-ink bg-white p-6 text-center shadow-pop">
                <p className="font-display text-3xl uppercase leading-none text-red">
                  Dur bakalım! 🍷
                </p>
                <p className="mt-3 font-hand text-2xl leading-snug text-ink">
                  {kapiGecersiz
                    ? "Kod eskimiş görünüyor. Barmenden QR'ı tekrar okutmasını iste."
                    : "Alkol almadan çark dönmez kardeşim. Barmenin yanına git, bir şeyler sipariş et, sana özel kodu okutsun!"}
                </p>
              </div>
              {pendingPrizes.length > 0 && (
                <div className="grid gap-2">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
                    Henüz kullanmadığın kodların
                  </p>
                  {pendingPrizes.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 border-2 border-ink bg-white px-3 py-2"
                    >
                      <span className="font-hand text-lg text-ink">
                        {p.label}
                      </span>
                      <span className="border-2 border-ink bg-red px-2 py-1 font-mono text-sm font-bold tracking-widest text-paper">
                        {p.prizeCode}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !customerId ? (
            <CustomerGate title="Çarkı Çevirmek İçin Katıl" />
          ) : slots.length === 0 ? (
            <p className="font-mono text-sm text-ink/50">
              Çark henüz hazırlanıyor, az sonra tekrar uğra.
            </p>
          ) : (
            <Wheel slots={slots} pendingPrizes={pendingPrizes} />
          )}
        </div>
      </main>
      <SiteFooter />
      <GrainOverlay />
    </>
  );
}
