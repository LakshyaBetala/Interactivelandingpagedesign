"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const metrics = [
  { value: "850+", label: "Gigs Completed" },
  { value: "₹4.2L+", label: "Transacted" },
  { value: "94%", label: "Completion Rate" },
  { value: "100+", label: "Active Users" },
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
      className="section-dark-bg relative w-full bg-[#0D0D0D] text-[#E6DFD5] py-32 lg:py-48 overflow-hidden"
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
          className="text-label text-[#FF5A1F] mb-16"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Featured Project
        </motion.p>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — Editorial with DoItForMe logo */}
          <div>
            {/* DoItForMe Logo + Title */}
            <motion.div
              className="flex items-center gap-5 mb-8"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-[#FF5A1F]/10"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/doitforme_logo.png"
                  alt="DoItForMe"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div>
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.93]">
                  DoItForMe.in
                </h2>
                <p className="text-label text-[#878074] mt-2">Student Gig Marketplace</p>
              </div>
            </motion.div>

            <motion.p
              className="text-[#A49D93] text-lg lg:text-xl leading-relaxed max-w-lg mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              A student gig marketplace with built-in escrow payments, 
              college-verified user profiles, and smart matching. 
              Designed to help students find and complete freelance 
              work within their campus ecosystem.
            </motion.p>

            <motion.a
              href="https://doitforme.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] text-label hover:from-[#E04A12] hover:to-[#FF5A1F] transition-all duration-300 group magnetic-hover"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Visit DoItForMe.in
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          </div>

          {/* Right — Metrics */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12 content-center">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                className="border-t border-[#3A3632] pt-6"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.7,
                  delay: 0.3 + i * 0.12,
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                }}
              >
                <p className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-[#E6DFD5]">
                  {metric.value}
                </p>
                <p className="text-label text-[#878074] mt-2">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonial strip */}
        <motion.div
          className="mt-24 lg:mt-32 border-t border-[#3A3632] pt-12 flex flex-col lg:flex-row lg:items-start gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p className="font-sans text-xl lg:text-2xl text-[#D9CFC2] italic leading-relaxed max-w-2xl">
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
