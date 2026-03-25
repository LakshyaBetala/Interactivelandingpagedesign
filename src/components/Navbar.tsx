"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import LeadModal from "./LeadModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

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
          <a href="#" className="flex items-center gap-2.5 group">
            <Image
              src="/almmatix_logo.png"
              alt="Almmatix"
              width={42}
              height={42}
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

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-10">
            {["Services", "Work", "Contact"].map((item) => (
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

          {/* CTA */}
          <button
            onClick={() => setModalOpen(true)}
            className={`cursor-pointer px-6 py-2.5 text-label transition-all duration-300 magnetic-hover border-none ${
              isDark
                ? "bg-[#E6DFD5] text-[#0D0D0D] hover:bg-[#FF5A1F] hover:text-[#E6DFD5]"
                : "bg-[#0D0D0D] text-[#E6DFD5] hover:bg-[#FF5A1F]"
            }`}
          >
            Start a project
          </button>
        </div>
      </nav>

      <LeadModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
