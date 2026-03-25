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
        className="w-full bg-[#E6DFD5] text-[#0D0D0D] py-32 lg:py-48 px-6 lg:px-12 relative overflow-hidden"
      >
        <div ref={ref} className="max-w-[1400px] mx-auto flex flex-col relative z-10">
          {/* Headline with Almmatix logo */}
          <motion.div
            className="flex items-end gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-display text-5xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.85]">
              Let&apos;s build.
            </h2>
            <motion.div
              className="hidden lg:block mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/almmatix_logo.png"
                alt="Almmatix"
                width={100}
                height={100}
                className="opacity-20"
              />
            </motion.div>
          </motion.div>

          {/* CTA + Contact */}
          <motion.div
            className="mt-16 lg:mt-24 flex flex-col lg:flex-row justify-between gap-16 border-t border-[#C4B8A8] pt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Left: CTA */}
            <div className="flex flex-col gap-6">
              <p className="text-[#878074] text-lg max-w-md leading-relaxed">
                Got a project? A wild idea? An operations nightmare?
                We want to hear it.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] text-label hover:from-[#E04A12] hover:to-[#FF5A1F] transition-all duration-300 w-max group magnetic-hover cursor-pointer border-none"
              >
                Start a conversation
                <span className="inline-block w-0 group-hover:w-6 h-[1px] bg-[#E6DFD5] transition-all duration-300" />
              </button>
            </div>

            {/* Right: Contact Info */}
            <div className="flex flex-col md:flex-row gap-16 text-sm">
              <div>
                <span className="text-label text-[#A49D93] block mb-3">Email</span>
                <a
                  href="mailto:almmatix@gmail.com"
                  className="text-[#0D0D0D] font-medium hover:text-[#FF5A1F] transition-colors duration-300"
                >
                  almmatix@gmail.com
                </a>
              </div>
              <div>
                <span className="text-label text-[#A49D93] block mb-3">Phone</span>
                <span className="text-[#0D0D0D] font-medium">+91 9344110272</span>
              </div>
              <div>
                <span className="text-label text-[#A49D93] block mb-3">Location</span>
                <span className="text-[#0D0D0D] font-medium">India</span>
              </div>
            </div>
          </motion.div>

          {/* Footer bottom */}
          <div className="mt-24 lg:mt-32 flex flex-col lg:flex-row justify-between items-center gap-4 border-t border-[#C4B8A8] pt-8">
            <div className="flex items-center gap-3">
              <Image
                src="/almmatix_logo.png"
                alt="Almmatix"
                width={28}
                height={28}
                className="opacity-50"
              />
              <span className="text-label text-[#A49D93]">
                © 2025 Almmatix. All rights reserved.
              </span>
            </div>
            <span className="text-label text-[#A49D93]">
              Engineered with precision.
            </span>
          </div>
        </div>
      </footer>

      <LeadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
