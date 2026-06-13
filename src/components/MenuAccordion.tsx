import type { Category, Product } from "@/data/menu";
import CategoryBand from "./CategoryBand";
import MenuCard from "./MenuCard";

/** cycle of base tilts so cards look hand-pasted */
const ROT = [-2, 1.5, -1, 2, -1.5, 1];

type OpenInfo = (product: Product) => void;

function Cards({
  items,
  accent,
  onOpenInfo,
}: {
  items: Product[];
  accent: "navy" | "red";
  onOpenInfo: OpenInfo;
}) {
  return (
    <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      {items.map((item, i) => (
        <div key={item.name} data-card className="mb-6 break-inside-avoid">
          <MenuCard
            item={item}
            accent={accent}
            rotate={ROT[i % ROT.length]}
            onOpen={onOpenInfo}
          />
        </div>
      ))}
    </div>
  );
}

type Props = {
  category: Category;
  open: boolean;
  onToggle: () => void;
  onOpenInfo: OpenInfo;
};

/**
 * One collapsible category. Header reuses CategoryBand; body animates open
 * via the grid-template-rows 0fr→1fr trick (smooth, no JS height math).
 */
export default function MenuAccordion({
  category,
  open,
  onToggle,
  onOpenInfo,
}: Props) {
  const panelId = `${category.id}-panel`;

  return (
    <div id={category.id} className="scroll-mt-24 border-b-2 border-ink/15 py-5">
      <CategoryBand
        title={category.title}
        kicker={category.kicker}
        accent={category.accent}
        open={open}
        onToggle={onToggle}
        panelId={panelId}
      />

      <div
        id={panelId}
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-6">
            {category.items && (
              <Cards
                items={category.items}
                accent={category.accent}
                onOpenInfo={onOpenInfo}
              />
            )}

            {category.groups?.map((g) => (
              <div key={g.label} className="mb-2">
                <h5 className="mb-4 mt-2 flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/60">
                  <span className="text-red">/</span>
                  {g.label}
                  <span className="h-px flex-1 bg-ink/15" />
                </h5>
                <Cards
                  items={g.items}
                  accent={category.accent}
                  onOpenInfo={onOpenInfo}
                />
              </div>
            ))}

            {category.note && (
              <div className="mt-1 border-2 border-dashed border-ink/40 bg-paper-dim/50 p-4 font-mono text-xs leading-relaxed text-ink/75">
                {category.note}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
