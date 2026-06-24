"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Genel ▲/▼ sıralama butonları — id'yi bir sıra yukarı/aşağı taşıyan bir
 *  server action'a bağlanır (kategoriler/ürünler/çark slotları aynı deseni kullanır). */
export default function MoveButtons({
  id,
  index,
  count,
  action,
}: {
  id: number;
  index: number;
  count: number;
  action: (id: number, dir: number) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const move = (dir: -1 | 1) =>
    start(async () => {
      await action(id, dir);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={index === 0 || pending}
        aria-label="Yukarı taşı"
        className="grid size-7 place-items-center border-2 border-ink bg-paper font-mono text-sm leading-none transition-transform hover:-translate-y-px disabled:opacity-25"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={index === count - 1 || pending}
        aria-label="Aşağı taşı"
        className="grid size-7 place-items-center border-2 border-ink bg-paper font-mono text-sm leading-none transition-transform hover:translate-y-px disabled:opacity-25"
      >
        ▼
      </button>
    </div>
  );
}
