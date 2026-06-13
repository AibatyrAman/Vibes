"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteCampaignAction,
  setCampaignsEnabledAction,
  toggleCampaignActiveAction,
} from "@/app/admin/actions";
import type { AdminCampaign } from "@/lib/menu-repo";

export default function CampaignManager({
  campaigns,
  enabled,
}: {
  campaigns: AdminCampaign[];
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div className={pending ? "opacity-60" : ""}>
      <label className="flex items-center gap-3 border-2 border-ink bg-paper p-4 shadow-pop">
        <input
          type="checkbox"
          defaultChecked={enabled}
          onChange={(e) => run(() => setCampaignsEnabledAction(e.target.checked))}
          className="size-5 accent-[#db1010]"
        />
        <span className="font-mono text-sm font-bold uppercase tracking-wide">
          Kampanya bölümünü menüde göster
        </span>
      </label>

      {campaigns.length === 0 ? (
        <p className="mt-6 font-mono text-sm text-ink/50">
          Henüz kampanya yok. “+ Yeni kampanya” ile ekle.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {campaigns.map((c) => {
            const pct =
              c.originalPrice && c.price < c.originalPrice
                ? Math.round((1 - c.price / c.originalPrice) * 100)
                : null;
            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-ink bg-paper p-4"
              >
                <div className="min-w-[200px] flex-1">
                  <div className="font-display text-2xl uppercase leading-none text-navy">
                    {c.name}
                  </div>
                  <div className="mt-1 font-mono text-xs text-ink/50">
                    {c.items
                      .map((i) => `${i.quantity}× ${i.productName}`)
                      .join(" · ") || "ürün yok"}
                  </div>
                </div>
                <div className="font-hand text-2xl font-bold text-red">
                  {c.originalPrice != null && (
                    <span className="mr-2 font-mono text-sm text-ink/40 line-through">
                      ₺{c.originalPrice}
                    </span>
                  )}
                  ₺{c.price}
                  {pct != null && (
                    <span className="ml-2 font-mono text-xs">%{pct}</span>
                  )}
                </div>
                <label className="flex items-center gap-1.5 font-mono text-xs uppercase">
                  <input
                    type="checkbox"
                    defaultChecked={c.active}
                    onChange={(e) =>
                      run(() =>
                        toggleCampaignActiveAction(c.id, e.target.checked),
                      )
                    }
                    className="size-5 accent-[#1800ad]"
                  />
                  Aktif
                </label>
                <Link
                  href={`/admin/campaigns/${c.id}`}
                  className="border-2 border-ink bg-paper px-3 py-1.5 text-xs font-bold uppercase hover:bg-ink hover:text-paper"
                >
                  Düzenle
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`"${c.name}" silinsin mi?`))
                      run(() => deleteCampaignAction(c.id));
                  }}
                  className="border-2 border-ink bg-red px-3 py-1.5 text-xs font-bold uppercase text-paper transition-transform hover:-translate-y-px"
                >
                  Sil
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
