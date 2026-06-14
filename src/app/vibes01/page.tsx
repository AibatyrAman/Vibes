import Link from "next/link";

const PALETTE = ["#db1010", "#1800ad", "#ebe9e1"];

export default function Vibes01() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-brand-paper px-5 py-20 text-center">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        {/* logo */}
        <h1 className="font-bubble text-[clamp(3.5rem,19vw,14rem)] leading-[0.85] text-brand-red">
          vibes
        </h1>

        {/* tagline 1 */}
        <p className="mt-5 max-w-full text-balance font-cond text-[clamp(0.85rem,3.1vw,1.8rem)] font-semibold uppercase tracking-[0.16em] text-brand-blue">
          Where every visit feels like the right vibe
        </p>

        {/* tagline 2 */}
        <p className="mt-7 max-w-full text-balance font-cond text-[clamp(1.6rem,7vw,4.75rem)] font-bold uppercase leading-[0.95] tracking-wide text-brand-blue">
          No rush, just vibes
        </p>

        {/* menü linki */}
        <Link
          href="/menu"
          className="mt-11 inline-block border-2 border-brand-blue bg-brand-blue px-8 py-3 font-cond text-base font-semibold uppercase tracking-[0.2em] text-brand-paper transition-transform hover:-translate-y-0.5"
        >
          Menü
        </Link>

        {/* renk paleti */}
        <div className="mt-16 flex items-end gap-6">
          {PALETTE.map((hex) => (
            <div key={hex} className="flex flex-col items-center gap-2">
              <span
                className="size-10 rounded-full border-2 border-brand-blue"
                style={{ backgroundColor: hex }}
              />
              <span className="font-cond text-[10px] font-semibold uppercase tracking-wide text-brand-blue/70">
                {hex}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
