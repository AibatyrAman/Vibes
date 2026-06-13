import { listProductsFlat } from "@/lib/menu-repo";
import CampaignForm from "@/components/admin/CampaignForm";
import { createCampaignAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function NewCampaignPage() {
  const products = listProductsFlat();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-4xl uppercase leading-none text-ink">
        Yeni Kampanya
      </h1>
      <CampaignForm action={createCampaignAction} products={products} />
    </div>
  );
}
