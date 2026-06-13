import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import SiteFooter from "@/components/SiteFooter";
import VirtualNapkin from "@/components/VirtualNapkin";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import { getMenu, getSetting } from "@/lib/menu-repo";

// Menü SQLite'tan okunuyor; admin değişiklikleri anında yansısın.
export const dynamic = "force-dynamic";

export default function Home() {
  const menu = getMenu();
  const chefNote = getSetting(
    "chef_note",
    "Tuzlu karamel cortado & portakallı kek.",
  );
  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main>
        <Hero />
        <MenuSection menu={menu} />
      </main>
      <SiteFooter />
      <VirtualNapkin note={chefNote} />
      <GrainOverlay />
    </>
  );
}
