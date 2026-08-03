import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import SiteFooter from "@/components/SiteFooter";
import VirtualNapkin from "@/components/VirtualNapkin";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import Gallery from "@/components/landing/Gallery";
import LandingLinks from "@/components/landing/LandingLinks";
import { getGallery } from "@/lib/gallery-repo";
import { getSetting } from "@/lib/menu-repo";

// Anasayfa SQLite'tan okunuyor (galeriler); admin değişiklikleri anında yansısın.
export const dynamic = "force-dynamic";

export default function LandingPage() {
  const kareler = getGallery("kareler");
  const yakalayanlar = getGallery("yakalayanlar");
  const chefNote = getSetting(
    "chef_note",
    "Tuzlu karamel cortado & portakallı kek.",
  );

  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main>
        <Hero
          kicker="Perlavista AVM · İstanbul"
          lines={["Vibes", "No rush."]}
          taglineSmall="Where every visit feels like the right vibe"
          taglineBig="Just vibes"
          primaryCta={{ href: "/menu", label: "Menüye göz at" }}
          secondaryCta={{ href: "/cark", label: "Çarkı çevir" }}
        />

        <Gallery
          title="Vibes'tan Kareler"
          kicker="Mekândan kareler"
          photos={kareler}
          accent="navy"
        />
        <Gallery
          title="Vibe'ını Yakalayanlar"
          kicker="Sizden gelenler"
          photos={yakalayanlar}
          accent="red"
        />
        <LandingLinks />
      </main>
      <SiteFooter />
      <VirtualNapkin note={chefNote} />
      <GrainOverlay />
    </>
  );
}
