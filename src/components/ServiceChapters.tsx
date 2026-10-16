"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import ServiceDrawer from "@/components/ServiceDrawer";
import ChapterRail from "@/components/ChapterRail";
import { ASVA, DOITFORME } from "@/lib/links";

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
            // Height is static: animating it would force layout on 64 nodes every
            // frame. Entry scales the wrapper, the inner bar keeps breathing in CSS.
            style={{ width: 3, height: h, transformOrigin: "center" }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={isInView ? { scaleY: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.7,
              delay: i * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="wave-bar w-full h-full rounded-full"
              style={{
                background: `linear-gradient(180deg, #FF7A47 0%, #FF5A1F 50%, #E04A12 100%)`,
                animationDelay: `${i * 70}ms`,
              }}
            />
          </motion.div>
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
    <div ref={ref} className="w-full h-full relative px-4 sm:px-0">
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
          style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)", maxWidth: "calc(100% - 16px)" }}
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
    <div ref={ref} className="w-full h-full flex items-center justify-center px-4 relative">
      {/* Phone, tucked behind the browser — this chapter covers apps as well as web */}
      <motion.div
        className="absolute right-2 sm:right-6 bottom-2 z-10 w-20 sm:w-24 aspect-[9/19] rounded-[1.1rem] border-[3px] border-[#0D0D0D] bg-[#EDE8E0] shadow-2xl shadow-[#0D0D0D]/20 overflow-hidden"
        initial={{ opacity: 0, y: 30, rotate: 6 }}
        animate={isInView ? { opacity: 1, y: 0, rotate: 4 } : {}}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-1 w-6 mx-auto mt-1 rounded-full bg-[#0D0D0D]/30" />
        <div className="px-2 pt-2 flex flex-col gap-1.5">
          <div className="h-8 rounded-sm bg-gradient-to-br from-[#FF5A1F]/20 to-[#FF7A47]/10" />
          <div className="h-1.5 w-3/4 rounded-sm bg-[#D9CFC2]" />
          <div className="h-1.5 w-1/2 rounded-sm bg-[#D9CFC2]" />
          <div className="mt-1 h-4 rounded-sm bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47]" />
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-sm border border-[#C4B8A8] overflow-hidden bg-[#EDE8E0] shadow-2xl shadow-[#0D0D0D]/10"
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      >
        {/* Browser bar */}
        <motion.div
          className="h-7 sm:h-9 border-b border-[#C4B8A8]/60 flex items-center px-3 gap-1.5 bg-[#E6DFD5]"
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
        <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
          {/* Hero block */}
          <motion.div
            className="h-16 sm:h-24 rounded-sm overflow-hidden relative"
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
              className="h-2 sm:h-2.5 rounded-sm bg-[#D9CFC2]"
              style={{ width: line.w }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: line.delay, ease: [0.16, 1, 0.3, 1] }}
            />
          ))}

          {/* CTA button */}
          <motion.div
            className="mt-2 sm:mt-3 w-20 sm:w-28 h-7 sm:h-9 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] rounded-sm"
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
          <div className="flex gap-2 sm:gap-3 mt-1 sm:mt-2">
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 h-11 sm:h-16 rounded-sm bg-[#D9CFC2] border border-[#C4B8A8]/40"
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
    title: "Apps & Web Platforms",
    subtitle: "Product Engineering",
    description:
      "Mobile apps, web platforms, storefronts and marketing sites — engineered from scratch, not assembled from templates. The copyright is assigned to you in writing before the first line is written.",
    why: {
      head: "Own the thing you sell through.",
      body:
        "A page builder rents you a storefront and keeps the keys. You get the codebase and the copyright in writing — an asset on your books, not a subscription you cannot leave.",
    },
    deepDive: [
      { head: "Buyers decide before they call", body: "They read your site, compare two rivals and set a price expectation — none of it with you in the room." },
      { head: "SEO compounds, ads are rented", body: "An ad stops the day you stop paying. A page that ranks keeps earning for years." },
      { head: "Buyers now ask AI, not Google", body: "ChatGPT and Perplexity read structured data, not carousels. We ship JSON-LD and llms.txt so you get quoted." },
      { head: "A page builder is a lease", body: "You get the repository and the copyright, assigned in writing before we start." },
      { head: "Speed is revenue", body: "Past three seconds mobile buyers leave — and Google ranks on the same signal." },
    ],
    visual: BrowserBuildVisual,
    dark: false,
    details: ["Android & iOS apps", "Web platforms & dashboards", "E-commerce & escrow flows", "Marketing sites & landing pages"],
    techStack: ["Next.js App Router", "React Native / Capacitor", "Tailwind CSS v4", "Vercel / Cloudflare Edge"],
    deliverables: ["UI/UX design", "Production codebase", "Written IP assignment", "Handover & maintenance plan"],
    live: { url: DOITFORME.home, label: "DoItForMe.in — built end to end" },
  },
  {
    number: "02",
    title: "Custom AI Solutions",
    subtitle: "Applied Intelligence",
    description:
      "Assistants and document pipelines trained only on your data. Every answer carries a citation, every document carries a permission — so the answer is checkable and the wrong person never sees it.",
    why: {
      head: "Answers somebody can check.",
      body:
        "A general chatbot guesses, and you find out in front of a customer. Ours cites the document it answered from — and never shows it to someone who should not see it.",
    },
    deepDive: [
      { head: "Your team answers this every week", body: "Policy, pricing and spec questions eat senior time, then come back next month." },
      { head: "A confident wrong answer is worse than none", body: "Every answer names the document it came from, so it can be checked before it is acted on." },
      { head: "Permissions sit in the retrieval", body: "If you cannot open the file, you cannot get its contents back through a question either." },
      { head: "Start where it already hurts", body: "One workflow, shipped and measured, before we touch a second." },
    ],
    visual: NeuralNetVisual,
    dark: true,
    details: ["Assistants trained on your own data", "Document processing & extraction", "Citation-backed answers", "Access-level permissions"],
    techStack: ["Pinecone / Weaviate", "LlamaIndex", "Gemini / OpenAI / Anthropic", "Supabase"],
    deliverables: ["Vector database setup", "Ingestion pipeline", "Chat interface", "Accuracy report"],
    live: null,
  },
  {
    number: "03",
    title: "Business AI Automation",
    subtitle: "Operations Infrastructure",
    description:
      "The work that should happen without anyone opening a laptop. Tally, CRMs and ERPs wired into one loop — reminders sent, payments reconciled, reports filed overnight. ASVA, our own collections agent, runs exactly this way.",
    why: {
      head: "Get paid without chasing.",
      body:
        "Every unpaid invoice is your capital funding someone else's business. ASVA reads the ledger, sends the bill and the UPI link, and reconciles overnight — ₹43L+ recovered, no calls made.",
    },
    deepDive: [
      { head: "Receivables are the cheapest capital", body: "Money you have already earned. No lender, no interest, no dilution." },
      { head: "Nobody wants to make the chase calls", body: "It is the first task that slips when the day gets busy. Software does not find it awkward." },
      { head: "Your ledger already knows", body: "We read Tally directly — nothing to install on the machine your accounts run on." },
      { head: "Language decides whether it gets paid", body: "Hindi, Gujarati or Marathi, from your own number, UPI link attached." },
      { head: "It runs while you sleep", body: "Bills out, reminders chased, payments reconciled FIFO by morning." },
    ],
    visual: FlowchartVisual,
    dark: true,
    details: ["Plugin-free Tally integration", "CRM & ERP syncing", "WhatsApp reminders with UPI links", "Overnight reconciliation & reporting"],
    techStack: ["Meta Cloud API", "Make.com / n8n", "Python Airflow", "PostgreSQL"],
    deliverables: ["System architecture docs", "Workflow schematics", "API endpoints", "Error handling & alerts"],
    live: { url: ASVA.home, label: "ASVA — our live collections agent" },
  },
  {
    number: "04",
    title: "Voice Agents",
    subtitle: "Conversational AI",
    description:
      "Voice agents that route inbound calls, qualify outbound leads and handle support in the caller's own language. No hold music, no scripts, no queue — just the conversation the caller rang for.",
    why: {
      head: "Never miss the call that was ready to buy.",
      body:
        "A missed call is a customer ringing your competitor. Agents answer every time in four languages and book the meeting — at 2am and on festival days.",
    },
    deepDive: [
      { head: "A missed call is a lost sale", body: "They ring your competitor ninety seconds later, and it shows up in no report." },
      { head: "Hold music is churn you paid for", body: "You spent money getting them to call. Queueing is the worst moment to lose them." },
      { head: "Not every caller speaks English", body: "Hindi, Tamil, Gujarati and Marathi, natively." },
      { head: "Every call becomes data", body: "Transcripts, intent and sentiment into your CRM. Anecdote becomes a fixable list." },
    ],
    visual: WaveformVisual,
    dark: false,
    details: ["Inbound query resolution", "Outbound lead qualification", "Sentiment & intent tracking", "Hindi, Tamil, Gujarati & Marathi"],
    techStack: ["Vapi / Retell AI", "OpenAI / Anthropic", "ElevenLabs Voice", "Twilio SIP"],
    deliverables: ["Custom voice model", "CRM integration", "Call transcripts", "Performance dashboard"],
    live: null,
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
  why: { head: string; body: string };
  visual: React.ComponentType;
  dark: boolean;
  index: number;
  live: { url: string; label: string } | null;
  onOpenDrawer: () => void;
}

function ServiceChapterItem({
  number,
  title,
  subtitle,
  description,
  why,
  visual: Visual,
  dark,
  index,
  live,
  onOpenDrawer,
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
      id={`chapter-${number}`}
      ref={ref}
      className={`section-dark-bg relative w-full flex items-center lg:min-h-svh ${
        dark ? "bg-[#0D0D0D] text-[#E6DFD5]" : "bg-[#E6DFD5] text-[#0D0D0D]"
      }`}
      style={{ position: "relative" }}
    >
      {/* Giant background number with parallax */}
      <motion.span
        aria-hidden="true"
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

      <div ref={contentRef} className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-14 md:py-20 lg:py-0">
        <div className={`flex flex-col-reverse lg:grid lg:grid-cols-2 gap-7 md:gap-14 lg:gap-24 items-center ${
          isEven ? "" : "lg:[direction:rtl]"
        }`}>
          {/* Text Side */}
          <motion.div
            className="flex flex-col lg:[direction:ltr] w-full"
            initial={{ opacity: 0, x: isEven ? -40 : 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Subtitle label */}
            <span
              className="text-label text-[#FF5A1F] mb-3 block"
            >
              {number} — {subtitle}
            </span>

            {/* Title with pop effect */}
            <h2
              className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.93] mb-6 md:mb-8"
            >
              {title}
            </h2>

            {/* Description */}
            <p
              className={`font-sans text-base md:text-lg lg:text-xl leading-relaxed max-w-lg mb-8 ${
                dark ? "text-[#A49D93]" : "text-[#878074]"
              }`}
            >
              {description}
            </p>

            {/* The business case — the reason a buyer should care, not what it does */}
            <motion.div
              className={`mb-8 border-l-2 pl-5 sm:pl-6 max-w-lg ${
                dark ? "border-[#FF5A1F]/70" : "border-[#FF5A1F]"
              }`}
              initial={{ opacity: 0, x: -12 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-label text-[#FF5A1F] mb-2.5">Why it matters</p>
              <p
                className={`font-display text-lg sm:text-xl lg:text-2xl font-bold tracking-normal leading-snug mb-2.5 text-balance ${
                  dark ? "text-[#E6DFD5]" : "text-[#0D0D0D]"
                }`}
              >
                {why.head}
              </p>
              <p
                className={`font-sans text-sm sm:text-base leading-relaxed ${
                  dark ? "text-[#A49D93]" : "text-[#878074]"
                }`}
              >
                {why.body}
              </p>
            </motion.div>

            {/* Interactive Button */}
            <div className="mt-2 md:mt-4 flex flex-col items-start gap-4 w-full sm:w-max">
              <button
                onClick={onOpenDrawer}
                className={`inline-flex items-center justify-center gap-4 px-6 md:px-8 py-3 md:py-3.5 border transition-colors duration-300 group w-full sm:w-max rounded-sm ${
                  dark
                    ? "border-[#3A3632] text-[#E6DFD5] hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/10"
                    : "border-[#C4B8A8] text-[#0D0D0D] hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5"
                }`}
              >
                <span className="font-medium text-sm tracking-wide">Learn Details</span>
                <span className="text-[#FF5A1F] transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>

              {live && (
                <a
                  href={live.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-label transition-colors duration-300 hover:text-[#FF5A1F] ${
                    dark ? "text-[#A49D93]" : "text-[#878074]"
                  }`}
                >
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                  {live.label}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            {/* Architectural line with animation */}
            <motion.div
              className={`hidden lg:block mt-12 w-full h-[1px] ${dark ? "bg-[#3A3632]" : "bg-[#C4B8A8]"}`}
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: isEven ? "left" : "right" }}
            />
          </motion.div>

          {/* Visual Side — purely illustrative, so hidden from screen readers */}
          <motion.div
            aria-hidden="true"
            className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/3] lg:[direction:ltr]"
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
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  return (
    <div id="services">
      <ChapterRail chapters={services.map((s) => ({ number: s.number, title: s.title }))} />
      <ServiceDrawer 
        isOpen={!!selectedService} 
        onClose={() => setSelectedService(null)} 
        service={selectedService} 
      />
      {services.map((service, index) => (
        <React.Fragment key={service.number}>
          {/* Gradient transition between sections */}
          {index > 0 && (
            <SectionTransition
              fromDark={services[index - 1].dark}
              toDark={service.dark}
            />
          )}
          <ServiceChapterItem 
            {...service} 
            index={index} 
            onOpenDrawer={() => setSelectedService(service)}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
