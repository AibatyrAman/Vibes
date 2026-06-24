import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import SiteFooter from "@/components/SiteFooter";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import Gallery from "@/components/landing/Gallery";
import LandingLinks from "@/components/landing/LandingLinks";
import { getGallery } from "@/lib/gallery-repo";

// Anasayfa SQLite'tan okunuyor (galeriler); admin değişiklikleri anında yansısın.
export const dynamic = "force-dynamic";

export default function LandingPage() {
  const kareler = getGallery("kareler");
  const yakalayanlar = getGallery("yakalayanlar");

  return (
    <>
      <Header />
      <Ticker tone="navy" />
      <main>
        <section className="border-b-4 border-ink bg-paper py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="animate-pop-in mb-4 inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] shadow-pop-sm">
              Perlavista AVM · İstanbul
            </p>
            <h1 className="animate-pop-in font-display text-[clamp(3rem,14vw,7.5rem)] uppercase leading-[0.85] text-navy text-pop-red [rotate:-1deg]">
              Vibes
            </h1>
            <p
              lang="en"
              className="animate-pop-in mt-4 font-mono text-sm font-bold uppercase tracking-[0.12em] text-ink/70 sm:text-base"
            >
              No rush, just vibes
            </p>
          </div>
        </section>

        <Gallery
          title="Vibes'tan Kareler"
          kicker="Mekândan kareler"
          photos={kareler}
        />
        <Gallery
          title="Vibe'ını Yakalayanlar"
          kicker="Sizden gelenler"
          photos={yakalayanlar}
        />
        <LandingLinks />
      </main>
      <SiteFooter />
      <GrainOverlay />
    </>
  );
}
