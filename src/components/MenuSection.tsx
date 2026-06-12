import { MENU } from "@/data/menu";
import CategoryBand from "./CategoryBand";
import MenuCard from "./MenuCard";

/** cycle of base tilts so cards look hand-pasted */
const ROT = [-2, 1.5, -1, 2, -1.5, 1];

export default function MenuSection() {
  return (
    <section
      id="menu"
      className="scroll-mt-16 border-b-4 border-ink bg-paper py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-2 -rotate-1">
          <h2 className="font-display text-6xl uppercase leading-none text-ink sm:text-7xl">
            Menü
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
            Kes · yapıştır · iç — günün kolajı
          </p>
        </div>

        {MENU.map((cat) => (
          <div key={cat.id} id={cat.id} className="scroll-mt-24">
            <CategoryBand
              title={cat.title}
              kicker={cat.kicker}
              accent={cat.accent}
            />
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {cat.items.map((item, i) => (
                <div
                  key={item.name}
                  className="animate-pop-in mb-6 break-inside-avoid"
                  style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                >
                  <MenuCard
                    item={item}
                    accent={cat.accent}
                    rotate={ROT[i % ROT.length]}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
