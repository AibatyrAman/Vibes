"use client";

import { useActionState } from "react";
import { redeemPrizeFormAction } from "@/app/admin/wheel-actions";

export default function RedeemPrizeForm() {
  const [state, action, pending] = useActionState(redeemPrizeFormAction, {});
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3 border-2 border-ink bg-paper p-5 shadow-pop"
    >
      <div className="flex-1">
        <label className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
          Müşterinin gösterdiği kod
        </label>
        <input
          name="code"
          required
          autoFocus
          placeholder="ör. A1B2C3D4"
          className="w-full border-2 border-ink bg-white px-3 py-2.5 font-mono uppercase outline-none focus:shadow-pop-sm"
        />
      </div>
      <button
        disabled={pending}
        className="border-2 border-ink bg-navy px-5 py-2.5 font-display text-lg uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Kontrol ediliyor…" : "Doğrula & kullan"}
      </button>
      {state?.error && (
        <p className="w-full font-mono text-sm text-red">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full font-mono text-sm font-bold text-navy">
          ✓ {state.success}
        </p>
      )}
    </form>
  );
}
