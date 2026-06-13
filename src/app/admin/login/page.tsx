"use client";

import { useActionState } from "react";
import Logo from "@/components/Logo";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <form
        action={action}
        className="w-full max-w-sm border-2 border-ink bg-paper p-6 shadow-pop"
      >
        <Logo className="mx-auto h-9 text-red" />
        <h1 className="mt-4 text-center font-display text-3xl uppercase tracking-wide text-navy">
          Admin Paneli
        </h1>
        <label className="mt-6 block font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
          Şifre
        </label>
        <input
          name="password"
          type="password"
          autoFocus
          required
          className="mt-1 w-full border-2 border-ink bg-white px-3 py-2.5 font-mono outline-none focus:shadow-pop-sm"
        />
        {state?.error && (
          <p className="mt-2 font-mono text-sm text-red">{state.error}</p>
        )}
        <button
          disabled={pending}
          className="mt-5 w-full border-2 border-ink bg-navy px-4 py-3 font-display text-xl uppercase tracking-wide text-paper shadow-pop transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
