import { Milk, Wheat, Egg } from "lucide-react";
import type { ComponentType } from "react";
import type { Allergen } from "@/data/menu";

type IconProps = { className?: string; strokeWidth?: number };

function NutIcon({ className, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21c-4 0-6-3-6-7 0-3 2-6 6-6s6 3 6 6c0 4-2 7-6 7Z" />
      <path d="M7 9c2-2 8-2 10 0" />
    </svg>
  );
}

function SoyIcon({ className, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 13c0-4 3-7 7-7s7 3 7 7-3 5-7 5-7-1-7-5Z" />
      <circle cx="10" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MAP: Record<Allergen, { label: string; Icon: ComponentType<IconProps> }> = {
  süt: { label: "Süt", Icon: Milk },
  gluten: { label: "Gluten", Icon: Wheat },
  yumurta: { label: "Yumurta", Icon: Egg },
  fındık: { label: "Fındık", Icon: NutIcon },
  soya: { label: "Soya", Icon: SoyIcon },
};

export default function AllergenIcons({ allergens }: { allergens?: Allergen[] }) {
  if (!allergens || allergens.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {allergens.map((a) => {
        const { label, Icon } = MAP[a];
        return (
          <span
            key={a}
            title={label}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-ink shadow-pop-sm"
          >
            <Icon strokeWidth={2.5} className="size-3.5 text-red" />
            {label}
          </span>
        );
      })}
    </div>
  );
}
