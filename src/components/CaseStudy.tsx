"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { MetricGrid, type MetricSpec } from "@/components/Metric";
import { DOITFORME } from "@/lib/links";

const metrics: MetricSpec[] = [
  { value: 1400, suffix: "+", label: "Verified Users", note: "Students onboarded and ID-checked" },
  { value: 8, label: "Companies Hiring", note: "Posting paid work on the platform" },
  { prefix: "₹", value: 3, suffix: "L+", label: "Gigs Posted", note: "Total value routed through escrow" },
  { value: 100, suffix: "%", label: "Escrow Protected", note: "Held until the 24-hour review closes" },
];

export default function CaseStudy() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 0.03]);

  return (
    <section
      id="work"
      ref={ref}
      className="section-dark-bg relative w-full bg-[#0D0D0D] text-[#E6DFD5] py-20 sm:py-32 lg:py-48 overflow-hidden"
      style={{ position: "relative" }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{ opacity: bgOpacity, background: "radial-gradient(ellipse at top right, #FF5A1F, transparent 70%)" }}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Label */}
        <motion.p
          className="text-label text-[#FF5A1F] mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Live Product — 02
        </motion.p>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left — Editorial with DoItForMe logo */}
          <div>
            {/* DoItForMe Logo + Title */}
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-8"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-[#FF5A1F]/10"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/images/doitforme_logo.png"
                  alt="DoItForMe"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div>
                <h2 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.93]">
                  DoItForMe.in
                </h2>
                <p className="text-label text-[#878074] mt-2">India{"’"}s Verified Student Workforce</p>
              </div>
            </motion.div>

            <motion.p
              className="text-[#A49D93] text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg mb-10 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              A two-sided marketplace where companies post real work — design,
              research, decks, code — and college-verified students deliver it.
              We engineered the whole stack: escrow payment routing, verified
              onboarding, matching, and a 24-hour review window before payout.
            </motion.p>

            <motion.a
              href={DOITFORME.home}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center sm:justify-start gap-4 px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] text-label hover:from-[#E04A12] hover:to-[#FF5A1F] transition-colors duration-300 group magnetic-hover"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Visit DoItForMe.in
              <svg aria-hidden="true" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          </div>

          {/* Right — Metrics */}
          <MetricGrid metrics={metrics} tone="dark" className="content-center" />
        </div>

        {/* Testimonial strip */}
        <motion.div
          className="mt-16 sm:mt-24 lg:mt-32 border-t border-[#3A3632] pt-8 sm:pt-12 flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p className="font-sans text-lg sm:text-xl lg:text-2xl text-[#D9CFC2] italic leading-relaxed max-w-2xl">
            {"\u201C"}They didn{"\u2019"}t just build a website — they engineered an
            entire operations layer for our marketplace. The difference
            is night and day.{"\u201D"}
          </p>
          <div className="flex flex-col">
            <span className="font-sans text-[#D9CFC2] font-medium">Founding Team</span>
            <span className="text-label text-[#878074]">DoItForMe.in</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
