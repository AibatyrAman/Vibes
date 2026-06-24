import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import CustomerGate from "@/components/CustomerGate";
import Wheel from "@/components/wheel/Wheel";
import { getCustomerId } from "@/lib/customer-auth";
import { getSetting } from "@/lib/menu-repo";
import { getTodaySpin, getWheelSlots } from "@/lib/wheel-repo";

export const dynamic = "force-dynamic";

export default async function CarkPage() {
  const enabled = getSetting("wheel_enabled", "1") === "1";
  const customerId = await getCustomerId();
  const slots = enabled ? getWheelSlots() : [];
  const todaySpin = customerId && enabled ? getTodaySpin(customerId) : null;

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
              Günde 1 çevirme hakkın var
            </p>
          </div>

          {!enabled ? (
            <p className="font-mono text-sm text-ink/50">
              Çark şu anda kapalı, az sonra tekrar uğra.
            </p>
          ) : !customerId ? (
            <CustomerGate title="Çarkı Çevirmek İçin Katıl" />
          ) : slots.length === 0 ? (
            <p className="font-mono text-sm text-ink/50">
              Çark henüz hazırlanıyor, az sonra tekrar uğra.
            </p>
          ) : (
            <Wheel slots={slots} initialSpin={todaySpin} />
          )}
        </div>
      </main>
      <SiteFooter />
      <GrainOverlay />
    </>
  );
}
