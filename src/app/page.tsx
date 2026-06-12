import Header from "@/components/Header";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import SiteFooter from "@/components/SiteFooter";
import VirtualNapkin from "@/components/VirtualNapkin";
import GrainOverlay from "@/components/scrap/GrainOverlay";

export default function Home() {
  return (
    <>
      <Header />
      <Ticker tone="red" />
      <main>
        <Hero />
        <MenuSection />
      </main>
      <SiteFooter />
      <VirtualNapkin />
      <GrainOverlay />
    </>
  );
}
