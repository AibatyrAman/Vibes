import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import CustomerGate from "@/components/CustomerGate";
import StampCard from "@/components/loyalty/StampCard";
import { getCustomerId } from "@/lib/customer-auth";
import { getCustomerCard } from "@/lib/loyalty-repo";
import { STAMPS_GOAL } from "@/lib/loyalty-constants";

export const dynamic = "force-dynamic";

export default async function BiraDefteriPage() {
  const customerId = await getCustomerId();
  const customer = customerId ? getCustomerCard(customerId) : null;

  return (
    <>
      <Header />
      <Ticker tone="navy" />
      <main className="border-b-4 border-ink bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-5">
          <div className="mb-8 -rotate-1">
            <h1 className="font-display text-6xl uppercase leading-none text-ink sm:text-7xl">
              Bira Defteri
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              {STAMPS_GOAL} bira al, {STAMPS_GOAL + 1}.si bedava
            </p>
          </div>

          {customer ? (
            <StampCard customer={customer} />
          ) : (
            <CustomerGate title="Bira Defterine Katıl" />
          )}
        </div>
      </main>
      <SiteFooter />
      <GrainOverlay />
    </>
  );
}
