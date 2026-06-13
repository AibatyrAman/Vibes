"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ConfirmDelete({
  action,
  message,
  label = "Sil",
}: {
  action: () => Promise<void>;
  message: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(message))
          start(async () => {
            await action();
            router.refresh();
          });
      }}
      className="border-2 border-ink bg-red px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
