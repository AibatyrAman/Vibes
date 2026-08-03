import Link from "next/link";
import { Martini, Disc3, Beer } from "lucide-react";
import CategoryBand from "@/components/CategoryBand";
import { STAMPS_GOAL } from "@/lib/loyalty-constants";

const CROT = [-1.5, 1, -1.5];

const LINKS = [
  {
    href: "/menu",
    icon: Martini,
    title: "Menü",
    desc: "Kahveden kokteyle, tüm Vibes menüsü.",
    tone: "navy" as const,
  },
  {
    href: "/cark",
    icon: Disc3,
    title: "Çarkı Felek",
    desc: "Her içkide 1 çevir, şansını dene.",
    tone: "red" as const,
  },
  {
    href: "/bira-defteri",
    icon: Beer,
    title: "Bira Defteri",
    desc: `${STAMPS_GOAL} bira al, ${STAMPS_GOAL + 1}.si bedava.`,
    tone: "navy" as const,
  },
];

const TONE_CLASSES = {
  navy: "bg-navy text-paper shadow-pop-navy hover:shadow-pop-navy-lg",
  red: "bg-red text-paper shadow-pop-red hover:shadow-pop-red-lg",
};

export default function LandingLinks() {
  return (
    <section className="border-b-4 border-ink bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <CategoryBand title="Vibe'ını seç" kicker="Nereye bakalım?" accent="red" />
        <div className="grid gap-6 sm:grid-cols-3">
          {LINKS.map(({ href, icon: Icon, title, desc, tone }, i) => (
            <Link
              key={href}
              href={href}
              style={{ rotate: `${CROT[i % CROT.length]}deg` }}
              className={`flex flex-col gap-3 border-2 border-ink p-6 transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:animate-wobble ${TONE_CLASSES[tone]}`}
            >
              <Icon strokeWidth={2.5} className="size-10" />
              <span className="font-display text-3xl uppercase leading-none">
                {title}
              </span>
              <span className="font-mono text-sm text-paper/80">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
