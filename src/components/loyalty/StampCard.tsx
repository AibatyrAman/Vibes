import type { Customer } from "@/lib/loyalty-repo";
import { STAMPS_GOAL } from "@/lib/loyalty-constants";
import { customerLogoutAction } from "@/app/customer-actions";

/** Müşterinin salt-okunur damga kartı — damgayı garson/admin ekler. */
export default function StampCard({ customer }: { customer: Customer }) {
  return (
    <div className="border-2 border-ink bg-white p-6 shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50">
            Hoş geldin
          </p>
          <p className="font-display text-2xl uppercase leading-none text-navy">
            {customer.username}
          </p>
        </div>
        <form action={customerLogoutAction}>
          <button className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/40 hover:text-red">
            Çıkış
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {Array.from({ length: STAMPS_GOAL }).map((_, i) => (
          <span
            key={i}
            className={`grid size-14 place-items-center border-2 border-ink text-3xl shadow-pop-sm ${
              i < customer.stamps ? "-rotate-3 bg-red" : "bg-paper-dim"
            }`}
          >
            🍺
          </span>
        ))}
      </div>

      <p className="mt-5 text-center font-mono text-sm text-ink/70">
        {customer.stamps} / {STAMPS_GOAL} damga
      </p>

      {customer.freeAvailable > 0 && (
        <p className="mt-4 -rotate-1 border-2 border-ink bg-navy px-4 py-2 text-center font-display text-xl uppercase text-paper shadow-pop-sm">
          🎉 {customer.freeAvailable} bedava biranız var!
        </p>
      )}

      <p className="mt-5 text-center font-mono text-[11px] text-ink/40">
        Her bira siparişinde garsona söyle, damgan eklensin.
      </p>
    </div>
  );
}
