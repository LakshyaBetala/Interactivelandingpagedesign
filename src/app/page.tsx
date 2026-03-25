import Navbar from "@/components/Navbar";
import AgencyHero from "@/components/AgencyHero";
import ServiceChapters from "@/components/ServiceChapters";
import CaseStudy from "@/components/CaseStudy";
import Footer from "@/components/Footer";

function SectionBridge({ from, to }: { from: "light" | "dark"; to: "light" | "dark" }) {
  if (from === to) return null;
  return (
    <div
      className="w-full h-20 lg:h-28"
      style={{
        background:
          from === "dark"
            ? "linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 25%, #3A3632 50%, #878074 75%, #E6DFD5 100%)"
            : "linear-gradient(180deg, #E6DFD5 0%, #C4B8A8 25%, #878074 50%, #3A3632 75%, #0D0D0D 100%)",
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E6DFD5] font-sans selection:bg-[#FF5A1F] selection:text-[#E6DFD5] overflow-x-hidden">
      <Navbar />
      <AgencyHero />
      <ServiceChapters />
      <SectionBridge from="light" to="dark" />
      <CaseStudy />
      <SectionBridge from="dark" to="light" />
      <Footer />
    </main>
  );
}
