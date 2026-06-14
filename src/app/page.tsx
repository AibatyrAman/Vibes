import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import SiteFooter from "@/components/SiteFooter";
import VirtualNapkin from "@/components/VirtualNapkin";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import {
  getActiveCampaigns,
  getGlassCavities,
  getMenu,
  getSetting,
} from "@/lib/menu-repo";

// Menü SQLite'tan okunuyor; admin değişiklikleri anında yansısın.
export const dynamic = "force-dynamic";

export default function Home() {
  const menu = getMenu();
  const chefNote = getSetting(
    "chef_note",
    "Tuzlu karamel cortado & portakallı kek.",
  );
  const campaignsEnabled = getSetting("campaigns_enabled", "1") === "1";
  const campaigns = campaignsEnabled ? getActiveCampaigns() : [];
  const glassCavities = getGlassCavities();
  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main>
        <Hero />
        <MenuSection
          menu={menu}
          campaigns={campaigns}
          glassCavities={glassCavities}
        />
      </main>
      <SiteFooter />
      <VirtualNapkin note={chefNote} />
      <GrainOverlay />
    </>
  );
}
