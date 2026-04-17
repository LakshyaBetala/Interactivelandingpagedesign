"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import LeadModal from "./LeadModal";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer
        id="contact"
        className="w-full bg-[#0D0D0D] text-[#E6DFD5] px-5 sm:px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-6 relative overflow-hidden"
      >
        <div ref={ref} className="max-w-[1400px] mx-auto relative z-10">
          {/* Row 1: Logo + CTA side by side */}
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 pb-8 sm:pb-12 border-b border-[#3A3632]"
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left: Logo + Tagline */}
            <div className="flex items-center gap-4">
              <Image
                src="/almmatix_logo.png"
                alt="Almmatix"
                width={48}
                height={48}
                style={{ width: 48, height: "auto" }}
              />
              <div>
                <span className="font-display text-2xl font-bold tracking-tight block">
                  Almmatix
                </span>
                <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-[#878074]">
                  Deep-Tech Infrastructure
                </span>
              </div>
            </div>

            {/* Right: CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] font-medium text-sm tracking-wide hover:from-[#E04A12] hover:to-[#FF5A1F] transition-all duration-300 group magnetic-hover cursor-pointer border-none"
            >
              Start a conversation
              <span className="inline-block w-0 group-hover:w-5 h-[1px] bg-[#E6DFD5] transition-all duration-300" />
            </button>
          </motion.div>

          {/* Row 2: Contact columns + Status */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-8 sm:py-10 border-b border-[#3A3632]"
            initial={{ y: 15 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Email</span>
              <a
                href="mailto:almmatix@gmail.com"
                className="text-sm font-medium hover:text-[#FF5A1F] transition-colors duration-300"
              >
                almmatix@gmail.com
              </a>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Phone</span>
              <span className="text-sm font-medium">+91 9344110272</span>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Socials</span>
              <div className="flex gap-4">
                {['LinkedIn', 'Twitter', 'GitHub'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-sm font-medium hover:text-[#FF5A1F] transition-colors duration-300"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-sm font-medium">Available</span>
              </div>
            </div>
          </motion.div>

          {/* Row 3: Marquee */}
          <div className="py-5 border-b border-[#3A3632] overflow-hidden">
            <motion.div
              className="flex gap-12 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-12 items-center">
                  {['VOICE AI', 'WHATSAPP MODS', 'RAG INFRA', 'EDGE APPS', 'CUSTOM CRM', 'API ENGINEERING', 'DATA PIPELINES'].map((tag) => (
                    <span key={tag} className="text-[9px] font-mono tracking-[0.3em] text-[#878074]/50">
                      {tag}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* SEO Paragraph */}
          <div className="py-8 border-b border-[#3A3632]">
            <p className="text-xs sm:text-sm text-[#878074] max-w-4xl leading-relaxed">
              Almmatix is an engineering studio dedicated to end-to-end <strong>software development</strong>, scalable <strong>web development</strong>, and integrating autonomous <strong>AI solutions</strong>. We transform operational bottlenecks into intelligent, automated pathways for modern enterprises.
            </p>
          </div>

          {/* Row 4: Copyright bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5">
            <span className="text-[10px] tracking-widest uppercase text-[#878074]/60 font-mono">
              © 2025 Almmatix. All rights reserved.
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#878074]/60 font-mono">
              Engineered with precision
            </span>
          </div>
        </div>
      </footer>

      <LeadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
