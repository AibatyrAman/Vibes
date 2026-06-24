"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function WheelToggle({
  enabled,
  action,
}: {
  enabled: boolean;
  action: (enabled: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label
      className={`flex items-center gap-3 border-2 border-ink bg-paper p-4 shadow-pop ${
        pending ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        defaultChecked={enabled}
        onChange={(e) =>
          start(async () => {
            await action(e.target.checked);
            router.refresh();
          })
        }
        className="size-5 accent-[#db1010]"
      />
      <span className="font-mono text-sm font-bold uppercase tracking-wide">
        Çarkı sitede göster
      </span>
    </label>
  );
}
