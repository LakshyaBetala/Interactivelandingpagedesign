"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import LeadModal from "./LeadModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      const navY = 40;
      const elements = document.elementsFromPoint(window.innerWidth / 2, navY);
      const darkSection = elements.some(
        (el) =>
          el.classList.contains("section-dark-bg") ||
          getComputedStyle(el).backgroundColor === "rgb(13, 13, 13)" ||
          getComputedStyle(el).backgroundColor === "rgb(10, 10, 10)"
      );
      setIsDark(darkSection);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      const close = () => setMobileMenuOpen(false);
      window.addEventListener("scroll", close, { passive: true });
      return () => window.removeEventListener("scroll", close);
    }
  }, [mobileMenuOpen]);

  const navLinks = ["Services", "Work", "Contact"];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? isDark
              ? "bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#3A3632]/30"
              : "bg-[#E6DFD5]/90 backdrop-blur-md border-b border-[#C4B8A8]/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <a href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/almmatix_logo.png"
                alt="Almmatix"
                width={42}
                height={42}
                style={{ width: 42, height: "auto" }}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <span
                className={`font-display text-xl font-bold tracking-tight transition-colors duration-500 ${
                  isDark ? "text-[#E6DFD5]" : "text-[#0D0D0D]"
                }`}
              >
                Almmatix
              </span>
            </a>

            {/* Secret OS Portal Gateway */}
            <a
              href="/portal"
              aria-label="Almmatix OS Gateway"
              className="relative inline-flex items-center justify-center p-1 group/gate select-none cursor-pointer"
            >
              <span className={`font-mono text-sm tracking-tighter opacity-15 group-hover/gate:opacity-100 group-hover/gate:text-[#FF5A1F] transition-all duration-300 ${
                isDark ? "text-[#E6DFD5]" : "text-[#0D0D0D]"
              }`}>
                //
              </span>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.15em] text-[#FF5A1F] bg-[#0c0c0c] px-1 py-0.5 border border-[#3A3632]/25 rounded scale-0 group-hover/gate:scale-100 origin-center transition-all duration-200 whitespace-nowrap shadow-lg">
                OS
              </span>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-label transition-colors duration-300 relative group ${
                  isDark
                    ? "text-[#A49D93]/60 hover:text-[#E6DFD5]"
                    : "text-[#878074] hover:text-[#0D0D0D]"
                }`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#FF5A1F] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className={`hidden md:inline-flex cursor-pointer px-6 py-2.5 text-label transition-all duration-300 magnetic-hover border-none ${
                isDark
                  ? "bg-[#E6DFD5] text-[#0D0D0D] hover:bg-[#FF5A1F] hover:text-[#E6DFD5]"
                  : "bg-[#0D0D0D] text-[#E6DFD5] hover:bg-[#FF5A1F]"
              }`}
            >
              Start a project
            </button>

            {/* Hamburger - Mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer border-none bg-transparent relative z-[60]`}
              aria-label="Toggle menu"
            >
              <motion.span
                className={`block w-6 h-[2px] transition-colors duration-300 ${
                  mobileMenuOpen ? "bg-[#E6DFD5]" : isDark ? "bg-[#E6DFD5]" : "bg-[#0D0D0D]"
                }`}
                animate={mobileMenuOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
              <motion.span
                className={`block w-6 h-[2px] transition-colors duration-300 ${
                  mobileMenuOpen ? "bg-[#E6DFD5]" : isDark ? "bg-[#E6DFD5]" : "bg-[#0D0D0D]"
                }`}
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className={`block w-6 h-[2px] transition-colors duration-300 ${
                  mobileMenuOpen ? "bg-[#E6DFD5]" : isDark ? "bg-[#E6DFD5]" : "bg-[#0D0D0D]"
                }`}
                animate={mobileMenuOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0D0D0D] flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {navLinks.map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-display text-4xl font-bold tracking-tight text-[#E6DFD5] hover:text-[#FF5A1F] transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              onClick={() => {
                setMobileMenuOpen(false);
                setModalOpen(true);
              }}
              className="mt-4 px-8 py-4 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] font-medium text-sm tracking-wide cursor-pointer border-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Start a project
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
