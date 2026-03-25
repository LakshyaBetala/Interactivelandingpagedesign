"use client";

import Navbar from "@/components/Navbar";
import AgencyHero from "@/components/AgencyHero";
import ServiceChapters from "@/components/ServiceChapters";
import CaseStudy from "@/components/CaseStudy";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";

import NoiseGradientBridge from "@/components/NoiseGradientBridge";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E6DFD5] font-sans selection:bg-[#FF5A1F] selection:text-[#E6DFD5] overflow-x-hidden">
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <AgencyHero />
      <ServiceChapters />
      <NoiseGradientBridge from="light" to="dark" />
      <CaseStudy />
      <NoiseGradientBridge from="dark" to="light" />
      <Footer />
    </main>
  );
}
