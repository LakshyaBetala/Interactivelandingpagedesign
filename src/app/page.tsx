import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AgencyHero from "@/components/AgencyHero";
import ServiceChapters from "@/components/ServiceChapters";
import AsvaCaseStudy from "@/components/AsvaCaseStudy";
import CaseStudy from "@/components/CaseStudy";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

import NoiseGradientBridge from "@/components/NoiseGradientBridge";

export const metadata: Metadata = {
  title: "Almmatix",
  description: "Transform your enterprise with AI voice agents, WhatsApp automation, and custom web platforms. We build scalable deep-tech infrastructure.",
};

export default function Home() {
  return (
    <main
      id="main"
      className="min-h-screen bg-[#E6DFD5] font-sans selection:bg-[#FF5A1F] selection:text-[#E6DFD5] overflow-x-hidden"
    >
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <AgencyHero />
      <ServiceChapters />
      {/* Proof: the two products we run in production. ASVA stays on sand
          (chapter 05 ends light), then one bridge into the dark closing act —
          case study and footer are both #0D0D0D, so no bridge between them. */}
      <AsvaCaseStudy />
      <NoiseGradientBridge from="light" to="dark" />
      <CaseStudy />
      <Footer />
    </main>
  );
}
