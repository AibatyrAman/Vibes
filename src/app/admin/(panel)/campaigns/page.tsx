import Link from "next/link";
import { getSetting, listCampaigns } from "@/lib/menu-repo";
import CampaignManager from "@/components/admin/CampaignManager";

export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const campaigns = listCampaigns();
  const enabled = getSetting("campaigns_enabled", "1") === "1";
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase leading-none text-ink">
            Kampanyalar
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink/50">
            {campaigns.length} kampanya
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="shrink-0 border-2 border-ink bg-navy px-4 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5"
        >
          + Yeni kampanya
        </Link>
      </div>
      <CampaignManager campaigns={campaigns} enabled={enabled} />
    </div>
  );
}
