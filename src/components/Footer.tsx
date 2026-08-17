"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import LeadModal from "./LeadModal";
import { ASVA, BOOK_A_CALL, CONTACT, DOITFORME } from "@/lib/links";

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
                src="/images/almmatix_logo.png"
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <a
                href={BOOK_A_CALL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] font-medium text-sm tracking-wide hover:from-[#E04A12] hover:to-[#FF5A1F] transition-colors duration-300 group magnetic-hover border-none"
              >
                Book a Call
                <span aria-hidden="true" className="inline-block w-0 group-hover:w-5 h-[1px] bg-[#E6DFD5] transition-[width] duration-300" />
              </a>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto border border-[#3A3632] text-[#D9CFC2] font-medium text-sm tracking-wide hover:border-[#FF5A1F] hover:text-[#E6DFD5] transition-colors duration-300 cursor-pointer bg-transparent"
              >
                Message Us
              </button>
            </div>
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
                href={`mailto:${CONTACT.email}`}
                className="text-sm font-medium hover:text-[#FF5A1F] transition-colors duration-300"
              >
                {CONTACT.email}
              </a>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Phone</span>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="text-sm font-medium hover:text-[#FF5A1F] transition-colors duration-300 tabular"
              >
                {CONTACT.phone}
              </a>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Products</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: "ASVA", href: ASVA.home },
                  { name: "DoItForMe.in", href: DOITFORME.home },
                ].map((product) => (
                  <a
                    key={product.name}
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-[#FF5A1F] transition-colors duration-300 w-max"
                  >
                    <span translate="no">{product.name}</span> <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074] block mb-2">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-sm font-medium">Taking new projects</span>
              </div>
              <a
                href={BOOK_A_CALL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#FF5A1F] hover:text-[#FF7A47] transition-colors duration-300 mt-1.5 inline-block"
              >
                Book a Call <span aria-hidden="true">↗</span>
              </a>
            </div>
          </motion.div>

          {/* Row 3: Marquee — decorative */}
          <div aria-hidden="true" className="py-5 border-b border-[#3A3632] overflow-hidden">
            <motion.div
              className="flex gap-12 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-12 items-center">
                  {['VOICE AI', 'WHATSAPP AUTOMATION', 'TALLY & ERP INTEGRATIONS', 'RAG INFRA', 'EDGE APPS', 'CUSTOM CRM', 'API ENGINEERING', 'DATA PIPELINES'].map((tag) => (
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
              Almmatix is an engineering studio dedicated to end-to-end <strong>software development</strong>, scalable <strong>web development</strong>, and integrating autonomous <strong>AI solutions</strong>. We transform operational bottlenecks into intelligent, automated pathways for modern enterprises. We also build our own products — <strong>ASVA</strong>, an AI collections agent that reads Tally and closes the loop on WhatsApp, and <strong>DoItForMe.in</strong>, India{"’"}s verified student workforce marketplace.
            </p>
          </div>

          {/* Row 4: Copyright bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-5">
            <span className="text-[10px] tracking-widest uppercase text-[#878074]/60 font-mono">
              © 2026 Almmatix. All rights reserved.
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
