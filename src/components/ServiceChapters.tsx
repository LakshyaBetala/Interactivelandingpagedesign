"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

/* ============================================================
   DRAMATIC VISUAL MODULES — Cinematic, animated service graphics
   ============================================================ */

function WaveformVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  const bars = Array.from({ length: 64 }, (_, i) => {
    const height = Math.sin(i * 0.25) * 50 + Math.cos(i * 0.15) * 20 + 40;
    return height;
  });

  return (
    <div ref={ref} className="w-full h-full flex flex-col items-center justify-center relative">
      {/* Pulsing background circle */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-[#FF5A1F]/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-[#FF5A1F]/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Main waveform */}
      <div className="flex items-center justify-center gap-[2px] relative z-10">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              background: `linear-gradient(180deg, #FF7A47 0%, #FF5A1F 50%, #E04A12 100%)`,
            }}
            initial={{ height: 2, opacity: 0, scaleY: 0 }}
            animate={
              isInView
                ? {
                    height: h,
                    opacity: 1,
                    scaleY: [0, 1.2, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.7,
              delay: i * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
      </div>

      {/* Floating label */}
      <motion.div
        className="mt-8 flex items-center gap-2"
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-[#FF5A1F]"
          animate={isInView ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="font-mono text-[10px] tracking-widest uppercase text-[#A49D93]">
          Live · Processing
        </span>
      </motion.div>
    </div>
  );
}

function MessageStackVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  const messages = [
    { text: "New lead from Mumbai", side: "left" as const, icon: "📍" },
    { text: "Qualification started...", side: "right" as const, icon: "⚡" },
    { text: "Meeting scheduled ✓", side: "left" as const, icon: "📅" },
    { text: "Follow-up sent", side: "right" as const, icon: "✉️" },
    { text: "Deal closed — ₹2.4L", side: "left" as const, icon: "🎯" },
  ];

  return (
    <div ref={ref} className="w-full h-full flex flex-col justify-center gap-3 px-4 max-w-sm mx-auto relative">
      {/* Connection line */}
      <motion.div
        className="absolute left-1/2 top-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#FF5A1F]/20 to-transparent"
        initial={{ height: 0 }}
        animate={isInView ? { height: "80%" } : {}}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      {messages.map((msg, i) => (
        <motion.div
          key={i}
          className={`flex items-center gap-3 ${
            msg.side === "right" ? "flex-row-reverse self-end" : "self-start"
          }`}
          initial={{
            opacity: 0,
            x: msg.side === "left" ? -60 : 60,
            scale: 0.8,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }
              : {}
          }
          transition={{
            duration: 0.7,
            delay: i * 0.2,
            ease: [0.16, 1, 0.3, 1],
            scale: { type: "spring", stiffness: 300, damping: 20, delay: i * 0.2 },
          }}
        >
          <motion.span
            className="text-lg"
            animate={isInView ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.4, delay: i * 0.2 + 0.5 }}
          >
            {msg.icon}
          </motion.span>
          <div
            className={`px-5 py-3 text-sm font-mono backdrop-blur-sm ${
              msg.side === "left"
                ? "bg-[#1A1A1A] text-[#D9CFC2] border border-[#3A3632]"
                : "bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5]"
            }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FlowchartVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  const nodes = [
    { label: "CRM", x: 15, y: 20, icon: "📊" },
    { label: "AI Engine", x: 50, y: 50, icon: "🧠", highlight: true },
    { label: "ERP", x: 85, y: 20, icon: "📋" },
    { label: "Dashboard", x: 85, y: 80, icon: "📈" },
    { label: "Alerts", x: 15, y: 80, icon: "🔔" },
  ];

  const connections = [
    { x1: 22, y1: 24, x2: 44, y2: 48 },
    { x1: 56, y1: 48, x2: 78, y2: 24 },
    { x1: 56, y1: 54, x2: 78, y2: 78 },
    { x1: 44, y1: 54, x2: 22, y2: 78 },
  ];

  return (
    <div ref={ref} className="w-full h-full relative">
      {/* Animated connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
            stroke="url(#emberGrad)" strokeWidth="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.4 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        {/* Gradient def */}
        <defs>
          <linearGradient id="emberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF7A47" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Data flow particles */}
      {connections.map((conn, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#FF5A1F]"
          style={{ left: `${conn.x1}%`, top: `${conn.y1}%` }}
          animate={
            isInView
              ? {
                  left: [`${conn.x1}%`, `${conn.x2}%`],
                  top: [`${conn.y1}%`, `${conn.y2}%`],
                  opacity: [0, 1, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            delay: 1.5 + i * 0.3,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "linear",
          }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={i}
          className={`absolute flex flex-col items-center gap-1.5 ${
            node.highlight ? "z-10" : ""
          }`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: i * 0.15,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <motion.div
            className={`px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 ${
              node.highlight
                ? "bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] shadow-lg shadow-[#FF5A1F]/20"
                : "bg-[#E6DFD5] text-[#0D0D0D] border border-[#C4B8A8]"
            }`}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-xs">{node.icon}</span>
            {node.label}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function NeuralNetVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  // Knowledge nodes
  const docs = [
    { label: "Confidential Q4 Report", tags: ["Q4", "revenue"], y: 0 },
    { label: "Customer Pipeline Data", tags: ["Customer", "data"], y: 1 },
    { label: "Strategic Acquisition", tags: ["acquisition", "target"], y: 2 },
    { label: "Board Meeting Notes", tags: ["meeting", "notes", "Dec"], y: 3 },
  ];

  return (
    <div ref={ref} className="w-full h-full flex flex-col justify-center gap-4 px-4 max-w-md mx-auto">
      {/* Search query animation */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2.5 border border-[#3A3632] bg-[#1A1A1A] mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          className="text-[#FF5A1F]"
          animate={isInView ? { opacity: [1, 0.4, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ▸
        </motion.span>
        <motion.span
          className="font-mono text-xs text-[#A49D93]"
          initial={{ width: 0 }}
          animate={isInView ? { width: "auto" } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          &quot;Show me Q4 revenue analysis&quot;
        </motion.span>
      </motion.div>

      {/* Document results */}
      {docs.map((doc, i) => (
        <motion.div
          key={i}
          className="flex flex-col gap-1.5"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1 h-1 rounded-full bg-[#FF5A1F]"
              animate={isInView ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 1, delay: 1 + i * 0.2, repeat: Infinity }}
            />
            <span className="font-mono text-[11px] text-[#A49D93]">{doc.label}</span>
          </div>
          <div className="flex gap-1.5 pl-3">
            {doc.tags.map((tag, j) => (
              <motion.span
                key={j}
                className="px-2 py-0.5 text-[10px] font-mono bg-[#FF5A1F] text-[#E6DFD5]"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{
                  duration: 0.3,
                  delay: 1 + i * 0.15 + j * 0.08,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Accuracy indicator */}
      <motion.div
        className="flex items-center gap-2 mt-2 pt-3 border-t border-[#3A3632]"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
      >
        <div className="w-16 h-1 bg-[#3A3632] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: "97%" } : {}}
            transition={{ duration: 1.5, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#FF5A1F]">97% match</span>
      </motion.div>
    </div>
  );
}

function BrowserBuildVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm border border-[#C4B8A8] overflow-hidden bg-[#EDE8E0] shadow-2xl shadow-[#0D0D0D]/10"
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      >
        {/* Browser bar */}
        <motion.div
          className="h-9 border-b border-[#C4B8A8]/60 flex items-center px-3 gap-1.5 bg-[#E6DFD5]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C4B8A8]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C4B8A8]" />
          <div className="flex-1 mx-4 h-4 rounded-sm bg-[#D9CFC2]" />
        </motion.div>

        {/* Content blocks with progressive build */}
        <div className="p-4 flex flex-col gap-3">
          {/* Hero block */}
          <motion.div
            className="h-24 rounded-sm overflow-hidden relative"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A1F]/10 to-[#FF7A47]/5" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF5A1F]/10 to-transparent"
              animate={isInView ? { x: ["-200%", "200%"] } : {}}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>

          {/* Text lines */}
          {[
            { w: "65%", delay: 0.9 },
            { w: "85%", delay: 1.05 },
            { w: "45%", delay: 1.2 },
          ].map((line, i) => (
            <motion.div
              key={i}
              className="h-2.5 rounded-sm bg-[#D9CFC2]"
              style={{ width: line.w }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: line.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* CTA button */}
          <motion.div
            className="mt-3 w-28 h-9 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] rounded-sm"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.5,
              delay: 1.5,
              type: "spring",
              stiffness: 200,
            }}
          />

          {/* Stats row */}
          <div className="flex gap-3 mt-2">
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 h-16 rounded-sm bg-[#D9CFC2] border border-[#C4B8A8]/40"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 1.7 + i * 0.1,
                  type: "spring",
                  stiffness: 200,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   SERVICE DATA
   ============================================================ */
const services = [
  {
    number: "01",
    title: "Voice Agents",
    subtitle: "Conversational AI",
    description:
      "24/7 human-like voice agents for inbound routing, outbound sales, and customer support. No hold music. No scripts. Just conversations that convert.",
    visual: WaveformVisual,
    dark: false,
  },
  {
    number: "02",
    title: "WhatsApp Automation",
    subtitle: "Omnichannel Messaging",
    description:
      "Automated lead qualification and omnichannel support across India, LatAm, and Europe. Every conversation tracked, every lead scored.",
    visual: MessageStackVisual,
    dark: true,
  },
  {
    number: "03",
    title: "Internal Workflows",
    subtitle: "Process Intelligence",
    description:
      "Connect CRMs and ERPs with intelligent logic. Eliminate manual data entry. Your team focuses on decisions, not spreadsheets.",
    visual: FlowchartVisual,
    dark: false,
  },
  {
    number: "04",
    title: "RAG Systems",
    subtitle: "Knowledge Intelligence",
    description:
      "Secure, hallucination-free AI assistants trained exclusively on your data. Your knowledge base, instantly searchable by anyone on your team.",
    visual: NeuralNetVisual,
    dark: true,
  },
  {
    number: "05",
    title: "Web Platforms",
    subtitle: "Digital Engineering",
    description:
      "High-converting digital platforms with AI built in. Not templates — custom-engineered storefronts and dashboards that actually work.",
    visual: BrowserBuildVisual,
    dark: false,
  },
];

/* ============================================================
   SERVICE CHAPTER COMPONENT — with dramatic pop-in animations
   ============================================================ */
interface ServiceChapterProps {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  visual: React.ComponentType;
  dark: boolean;
  index: number;
}

function ServiceChapterItem({
  number,
  title,
  subtitle,
  description,
  visual: Visual,
  dark,
  index,
}: ServiceChapterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(contentRef, { once: true, margin: "-20%" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const numberY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const visualScale = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.85, 1, 1]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]);

  const isEven = index % 2 === 0;

  return (
    <section
      ref={ref}
      className={`section-dark-bg relative w-full min-h-screen flex items-center ${
        dark ? "bg-[#0D0D0D] text-[#E6DFD5]" : "bg-[#E6DFD5] text-[#0D0D0D]"
      }`}
    >
      {/* Giant background number with parallax */}
      <motion.span
        style={{ y: numberY }}
        className={`absolute right-6 lg:right-12 font-display text-chapter-number pointer-events-none select-none ${
          dark ? "text-[#E6DFD5]/[0.03]" : "text-[#0D0D0D]/[0.03]"
        }`}
      >
        {number}
      </motion.span>

      {/* Subtle side accent line */}
      <motion.div
        className={`absolute ${isEven ? "left-0" : "right-0"} top-1/4 w-[2px] bg-gradient-to-b from-transparent via-[#FF5A1F]/30 to-transparent`}
        initial={{ height: 0 }}
        animate={isInView ? { height: "50%" } : {}}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div ref={contentRef} className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-24 lg:py-0">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${
          isEven ? "" : "lg:[direction:rtl]"
        }`}>
          {/* Text Side */}
          <motion.div
            className="flex flex-col lg:[direction:ltr]"
            initial={{ opacity: 0, x: isEven ? -40 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtitle label */}
            <motion.span
              className="text-label text-[#FF5A1F] mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {number} — {subtitle}
            </motion.span>

            {/* Title with pop effect */}
            <motion.h2
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.93] mb-8"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className={`font-sans text-lg lg:text-xl leading-relaxed max-w-lg ${
                dark ? "text-[#A49D93]" : "text-[#878074]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {description}
            </motion.p>

            {/* Architectural line with animation */}
            <motion.div
              className={`mt-12 w-full h-[1px] ${dark ? "bg-[#3A3632]" : "bg-[#C4B8A8]"}`}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: isEven ? "left" : "right" }}
            />
          </motion.div>

          {/* Visual Side — with dramatic scale-up pop */}
          <motion.div
            className="relative w-full aspect-square lg:aspect-[4/3] lg:[direction:ltr]"
            style={{ scale: visualScale, opacity: visualOpacity }}
          >
            {/* Background glow for visual container */}
            {dark && (
              <motion.div
                className="absolute inset-0 -m-4 bg-[#FF5A1F]/[0.02] rounded-lg blur-xl"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              />
            )}
            <Visual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION TRANSITION — smooth gradient between sections
   ============================================================ */
function SectionTransition({ fromDark, toDark }: { fromDark: boolean; toDark: boolean }) {
  if (fromDark === toDark) return null;

  return (
    <div
      className="w-full h-20 lg:h-28"
      style={{
        background: fromDark
          ? `linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 30%, #3A3632 60%, #878074 80%, #E6DFD5 100%)`
          : `linear-gradient(180deg, #E6DFD5 0%, #D9CFC2 20%, #878074 50%, #3A3632 70%, #1A1A1A 85%, #0D0D0D 100%)`,
      }}
    />
  );
}

/* ============================================================
   EXPORT — renders all 5 chapters with smooth transitions
   ============================================================ */
export default function ServiceChapters() {
  return (
    <div id="services">
      {services.map((service, index) => (
        <React.Fragment key={service.number}>
          {/* Gradient transition between sections */}
          {index > 0 && (
            <SectionTransition
              fromDark={services[index - 1].dark}
              toDark={service.dark}
            />
          )}
          <ServiceChapterItem {...service} index={index} />
        </React.Fragment>
      ))}
    </div>
  );
}
