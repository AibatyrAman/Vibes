"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { Customer } from "@/lib/loyalty-repo";
import { STAMPS_GOAL } from "@/lib/loyalty-constants";
import { addPunchAction, redeemFreeAction } from "@/app/admin/loyalty-actions";

export default function LoyaltyManager({
  customers,
}: {
  customers: Customer[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      !q
        ? customers
        : customers.filter(
            (c) => c.username.toLowerCase().includes(q) || c.phone.includes(q),
          ),
    [customers, q],
  );

  if (customers.length === 0)
    return (
      <p className="font-mono text-sm text-ink/50">
        Henüz hesap açan müşteri yok. Müşteri /vibes/bira-defteri üzerinden
        kullanıcı adı + telefonla katılır.
      </p>
    );

  return (
    <div className="grid gap-4">
      <div className="relative max-w-sm">
        <Search
          strokeWidth={2.5}
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/50"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kullanıcı adı veya telefon ara…"
          className="w-full border-2 border-ink bg-white py-2 pl-9 pr-3 font-mono text-sm outline-none focus:shadow-pop-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-ink/50">Eşleşen müşteri yok.</p>
      ) : (
        <div
          className={`grid gap-3 transition-opacity ${pending ? "opacity-60" : ""}`}
        >
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-4 border-2 border-ink bg-paper p-4"
            >
              <div className="min-w-[10rem] flex-1">
                <p className="font-display text-xl uppercase leading-none text-navy">
                  {c.username}
                </p>
                <p className="font-mono text-xs text-ink/50">{c.phone}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: STAMPS_GOAL }).map((_, i) => (
                  <span
                    key={i}
                    className={`grid size-7 place-items-center border-2 border-ink font-mono text-xs font-bold ${
                      i < c.stamps
                        ? "bg-red text-paper"
                        : "bg-white text-ink/30"
                    }`}
                  >
                    🍺
                  </span>
                ))}
              </div>

              <span className="border-2 border-ink bg-navy px-2 py-1 font-mono text-xs font-bold text-paper">
                {c.freeAvailable} bedava hak
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => addPunchAction(c.id))}
                  className="border-2 border-ink bg-ink px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5"
                >
                  +1 Bira
                </button>
                <button
                  type="button"
                  disabled={pending || c.freeAvailable <= 0}
                  onClick={() => run(() => redeemFreeAction(c.id))}
                  className="border-2 border-ink bg-red px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-30"
                >
                  Bedava kullan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
