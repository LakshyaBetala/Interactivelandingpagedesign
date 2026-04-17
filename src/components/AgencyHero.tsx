import React from "react";
import AgencyHeroClient from "@/components/AgencyHeroClient";

export default function AgencyHero() {
  return (
    <section className="relative w-full min-h-[100svh] flex flex-col justify-center lg:justify-end bg-[#E6DFD5] overflow-hidden pb-10 sm:pb-16 lg:pb-24 pt-20 sm:pt-24">
      {/* Interactive Background Elements (Client) */}
      <AgencyHeroClient />

      {/* Static Core Content (Server) */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-5 sm:px-6 lg:px-12 pointer-events-none">
        <div className="mb-5 sm:mb-12 pointer-events-auto w-max">
          <p className="text-label text-[#878074]">
            Deep-Tech Infrastructure Studio
          </p>
        </div>

        <div className="pointer-events-auto">
          <h1 className="font-display text-massive">
            <span className="block text-[#0D0D0D]">We build the</span>
            <span className="block text-[#0D0D0D]">infrastructure.</span>
            <span className="block text-[#FF5A1F]">You scale.</span>
          </h1>
        </div>

        <div className="mt-6 sm:mt-12 lg:mt-16 flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-8 pointer-events-auto">
          <p className="font-sans text-[#878074] text-sm sm:text-lg lg:text-xl max-w-lg leading-relaxed pointer-events-auto">
            Voice agents. WhatsApp automation. AI systems. Web platforms.
            Engineered for enterprises that refuse to stay manual.
          </p>
          <a
            href="#services"
            className="inline-flex items-center gap-3 text-label text-[#0D0D0D] group pointer-events-auto"
          >
            <span>Explore services</span>
            <span className="inline-block w-8 h-[1px] bg-[#0D0D0D] group-hover:w-16 transition-all duration-500" />
          </a>
        </div>
      </div>
    </section>
  );
}
