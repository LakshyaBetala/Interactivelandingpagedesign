"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import InteractiveDataCore from "@/components/InteractiveDataCore";

export default function AgencyHeroClient() {
  return (
    <>
      {/* Elastic Fluid Canvas Mesh */}
      <InteractiveDataCore />

      {/* Background: Floating Almmatix logo mark */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] pointer-events-none select-none"
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 1, 0, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-[50vw] sm:w-[40vw] max-w-[500px] aspect-square opacity-5">
            <Image
              src="/images/almmatix_logo.png"
              alt="Almmatix Logo"
              fill
              sizes="(max-width: 640px) 50vw, 40vw"
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Ember accent line */}
      <div className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] w-full max-w-[30vw] opacity-70" />

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#0D0D0D]/8" />

      {/* Scrolling Marquee Strip */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden py-2 sm:py-3 border-t border-[#0D0D0D]/5">
        <motion.div
          className="flex whitespace-nowrap gap-10 sm:gap-16 w-max items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).map((_, setIdx) => (
            <div key={setIdx} className="flex gap-10 sm:gap-16 flex-shrink-0 items-center">
              {[
                "Voice AI",
                "WhatsApp Bots",
                "RAG Systems",
                "Web Platforms",
                "Data Pipelines",
                "CRM Integration",
                "Custom Dashboards",
                "API Engineering",
              ].map((item, i) => (
                <span
                  key={`${setIdx}-${i}`}
                  className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#C4B8A8]"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
