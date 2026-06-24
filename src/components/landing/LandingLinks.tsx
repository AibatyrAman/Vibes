import Link from "next/link";
import { Martini, Disc3, Beer } from "lucide-react";

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
    desc: "Günde 1 çevir, şansını dene.",
    tone: "red" as const,
  },
  {
    href: "/bira-defteri",
    icon: Beer,
    title: "Bira Defteri",
    desc: "6 bira al, 7.si bedava.",
    tone: "navy" as const,
  },
];

const TONE_CLASSES = {
  navy: "bg-navy text-paper shadow-pop-navy hover:shadow-pop-navy-lg",
  red: "bg-red text-paper shadow-pop-red hover:shadow-pop-red-lg",
};

export default function LandingLinks() {
  return (
    <section className="border-b-4 border-ink bg-ink py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-8 rotate-1">
          <h2 className="font-display text-5xl uppercase leading-none text-paper sm:text-6xl">
            Vibe&apos;ını seç
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {LINKS.map(({ href, icon: Icon, title, desc, tone }) => (
            <Link
              key={href}
              href={href}
              className={`group flex flex-col gap-3 border-2 border-ink p-6 transition-all hover:-translate-y-1 ${TONE_CLASSES[tone]}`}
            >
              <Icon strokeWidth={2.5} className="size-10" />
              <span className="font-display text-3xl uppercase leading-none">
                {title}
              </span>
              <span className="font-mono text-sm opacity-80">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
