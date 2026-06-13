import { notFound } from "next/navigation";
import { getCampaign, listProductsFlat } from "@/lib/menu-repo";
import CampaignForm from "@/components/admin/CampaignForm";
import {
  deleteCampaignAndBackAction,
  updateCampaignAction,
} from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cid = Number(id);
  const campaign = getCampaign(cid);
  if (!campaign) notFound();
  const products = listProductsFlat();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-4xl uppercase leading-none text-ink">
        Kampanyayı Düzenle
      </h1>
      <CampaignForm
        action={updateCampaignAction.bind(null, cid)}
        campaign={campaign}
        products={products}
      />
      <form action={deleteCampaignAndBackAction.bind(null, cid)} className="mt-4">
        <button className="border-2 border-ink bg-red px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5">
          Bu kampanyayı sil
        </button>
      </form>
    </div>
  );
}
