import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import SiteFooter from "@/components/SiteFooter";
import VirtualNapkin from "@/components/VirtualNapkin";
import GrainOverlay from "@/components/scrap/GrainOverlay";
import { getMenu } from "@/lib/menu-repo";

// Menü SQLite'tan okunuyor; admin değişiklikleri anında yansısın.
export const dynamic = "force-dynamic";

export default function Home() {
  const menu = getMenu();
  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main>
        <Hero />
        <MenuSection menu={menu} />
      </main>
      <SiteFooter />
      <VirtualNapkin />
      <GrainOverlay />
    </>
  );
}
