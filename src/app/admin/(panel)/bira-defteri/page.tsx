import { listCustomers } from "@/lib/loyalty-repo";
import LoyaltyManager from "@/components/admin/LoyaltyManager";

export const dynamic = "force-dynamic";

export default function BiraDefteriAdminPage() {
  const customers = listCustomers();
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-4xl uppercase leading-none text-ink">
          Bira Defteri
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
          {customers.length} hesap · 6 damgada 1 bedava bira
        </p>
      </div>
      <LoyaltyManager customers={customers} />
    </div>
  );
}
