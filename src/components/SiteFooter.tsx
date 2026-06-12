import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

/** Red "wet glass" coaster ring left on the navy paper. */
function CoasterStain({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden
      style={{ rotate: "-8deg" }}
    >
      <circle cx="100" cy="100" r="78" fill="var(--color-red)" opacity="0.1" />
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="none"
        stroke="var(--color-red)"
        strokeWidth="9"
        opacity="0.55"
        strokeLinecap="round"
        strokeDasharray="120 18 70 10 150 22"
      />
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke="var(--color-red)"
        strokeWidth="3"
        opacity="0.4"
        strokeDasharray="90 14 60 20"
      />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy text-paper">
      {/* extra grain on the navy */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 opacity-[0.08]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3">
        {/* wordmark + tagline */}
        <div>
          <Logo className="h-12 text-paper" />
          <p
            lang="en"
            className="mt-5 max-w-xs font-mono text-sm leading-relaxed text-paper/80"
          >
            Where every visit feels like the right vibe.
          </p>
          <a
            href="https://instagram.com/vibesobsesif"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 border-2 border-paper bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest shadow-[5px_5px_0_#db1010] transition-transform hover:-translate-y-0.5"
          >
            <Instagram strokeWidth={2.5} className="size-4" />
            @vibesobsesif
          </a>
        </div>

        {/* address + phone */}
        <div className="font-mono text-sm">
          <h3 className="font-display text-2xl uppercase tracking-wide text-red">
            Adres
          </h3>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Perlavista+AVM+Adnan+Kahveci+Beylikd%C3%BCz%C3%BC+Istanbul"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-start gap-2 text-paper/85 transition-colors hover:text-paper"
          >
            <MapPin strokeWidth={2.5} className="mt-0.5 size-4 shrink-0 text-red" />
            <span>
              Adnan Kahveci Mah., Perlavista AVM,
              <br />
              3. Kat Teras · İstanbul 34500
            </span>
          </a>
          <a
            href="tel:+905437163633"
            className="mt-3 flex items-center gap-2 text-paper/85 transition-colors hover:text-paper"
          >
            <Phone strokeWidth={2.5} className="size-4 shrink-0 text-red" />
            0543 716 36 33
          </a>
        </div>

        {/* hours, sat on the coaster stain */}
        <div className="relative">
          <CoasterStain className="pointer-events-none absolute -right-6 -top-10 size-56" />
          <div className="relative">
            <h3 className="font-display text-2xl uppercase tracking-wide text-red">
              Saatler
            </h3>
            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-paper/85">
              <Clock strokeWidth={2.5} className="size-4 shrink-0 text-red" />
              Her gün
            </p>
            <p className="mt-1 font-display text-5xl leading-none text-paper">
              10:00
              <span className="px-2 text-red">—</span>
              22:00
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-paper/70">
              Kahve · Şarap · Kokteyl
            </p>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t-2 border-paper/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 font-mono text-[11px] uppercase tracking-widest text-paper/60 sm:flex-row">
          <span>© 2026 Vibes</span>
          <span lang="en" className="text-paper/80">No rush, just vibes.</span>
          <span>Made with grain &amp; espresso</span>
        </div>
      </div>
    </footer>
  );
}
