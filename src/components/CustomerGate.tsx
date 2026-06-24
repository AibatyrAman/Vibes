"use client";

import { useActionState } from "react";
import { registerOrLoginAction } from "@/app/customer-actions";

/** Müşteri çerezi yoksa çark/bira defteri sayfalarında gösterilen kayıt/giriş formu. */
export default function CustomerGate({ title }: { title: string }) {
  const [state, action, pending] = useActionState(registerOrLoginAction, {});
  return (
    <div className="mx-auto max-w-sm border-2 border-ink bg-paper p-6 shadow-pop">
      <h2 className="font-display text-3xl uppercase leading-none text-navy">
        {title}
      </h2>
      <p className="mt-2 font-mono text-xs text-ink/60">
        Devam etmek için kullanıcı adı ve telefonunla katıl. SMS gelmez,
        sadece tanımak için kullanılır.
      </p>
      <form action={action} className="mt-5 grid gap-3">
        <div>
          <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
            Kullanıcı adı
          </label>
          <input
            name="username"
            required
            autoFocus
            placeholder="ör. aybars34"
            className="w-full border-2 border-ink bg-white px-3 py-2.5 font-mono outline-none focus:shadow-pop-sm"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
            Telefon
          </label>
          <input
            name="phone"
            type="tel"
            required
            placeholder="05xx xxx xx xx"
            className="w-full border-2 border-ink bg-white px-3 py-2.5 font-mono outline-none focus:shadow-pop-sm"
          />
        </div>
        {state?.error && (
          <p className="font-mono text-sm text-red">{state.error}</p>
        )}
        <button
          disabled={pending}
          className="mt-1 border-2 border-ink bg-navy px-4 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Katılıyor…" : "Katıl"}
        </button>
        <p className="font-mono text-[10px] text-ink/40">
          Daha önce katıldıysan aynı kullanıcı adı + telefonla devam et.
        </p>
      </form>
    </div>
  );
}
