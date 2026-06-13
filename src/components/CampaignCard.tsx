import type { AdminCampaign } from "@/lib/menu-repo";

/** Menü üstündeki kampanya kartı — kırmızı vurgulu, dikkat çekici. */
export default function CampaignCard({
  campaign,
  rotate = 0,
}: {
  campaign: AdminCampaign;
  rotate?: number;
}) {
  const pct =
    campaign.originalPrice && campaign.price < campaign.originalPrice
      ? Math.round((1 - campaign.price / campaign.originalPrice) * 100)
      : null;
  const items =
    campaign.items.map((i) => `${i.quantity}× ${i.productName}`).join(" · ") ||
    null;

  return (
    <article
      style={{ rotate: `${rotate}deg` }}
      className="relative border-2 border-ink bg-paper p-4 pb-5 shadow-pop-red"
    >
      <span className="absolute -right-3 -top-3 z-10 -rotate-6 border-2 border-ink bg-red px-2 py-0.5 font-hand text-lg font-bold leading-none text-paper shadow-pop-sm">
        Kampanya
      </span>

      <h4 className="max-w-[88%] font-display text-2xl uppercase leading-none text-navy sm:text-[1.7rem]">
        {campaign.name}
      </h4>

      {items && (
        <p className="mt-2 font-mono text-sm font-bold leading-snug text-ink/80">
          {items}
        </p>
      )}
      {campaign.description && (
        <p className="mt-1 font-mono text-xs leading-snug text-ink/60">
          {campaign.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        {campaign.originalPrice != null && (
          <span className="font-mono text-base text-ink/40 line-through">
            ₺{campaign.originalPrice}
          </span>
        )}
        <span className="font-hand text-4xl font-bold leading-none text-red">
          ₺{campaign.price}
        </span>
        {pct != null && (
          <span className="-rotate-2 border-2 border-ink bg-red px-2 py-0.5 font-hand text-base font-bold leading-none text-paper shadow-pop-sm">
            %{pct} indirim
          </span>
        )}
      </div>
    </article>
  );
}
