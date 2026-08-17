"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MetricGrid, type MetricSpec } from "@/components/Metric";
import { ASVA } from "@/lib/links";

const metrics: MetricSpec[] = [
  { prefix: "₹", value: 43, suffix: "L+", label: "Recovered", note: "During the live pilot" },
  { value: 160, label: "Day Credit Cycle", note: "Average before ASVA steps in" },
  { value: 1966, label: "Debtors Tracked", note: "Read straight from Tally" },
  { prefix: "₹", value: 36650, label: "Collected Nightly", note: "A typical overnight run" },
];

/** The overnight run, shown the way the shop owner sees it the next morning. */
const nightlyRun = [
  { count: "07", action: "Bills sent" },
  { count: "12", action: "Reminders chased" },
  { count: "₹36,650", action: "Collected" },
];

export default function AsvaCaseStudy() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      id="asva"
      ref={ref}
      className="relative w-full bg-[#E6DFD5] text-[#0D0D0D] border-t border-[#C4B8A8] py-20 sm:py-28 lg:py-40 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 relative z-10">
        <motion.p
          className="text-label text-[#FF5A1F] mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Live Product — 01
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left — editorial */}
          <div>
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2
                className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
                translate="no"
              >
                ASVA
              </h2>
              <p className="text-label text-[#878074] sm:mb-3">
                AI Collections Agent
              </p>
            </motion.div>

            <motion.p
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-6 text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              Stop chasing. Get paid.
            </motion.p>

            <motion.p
              className="text-[#878074] text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Indian distributors wait an average of 160&nbsp;days to get paid,
              and someone has to phone every debtor to make it happen. ASVA
              reads your Tally ledger without a plugin, sends the bill and the
              UPI link from your own WhatsApp number in Hindi, Gujarati or
              Marathi, then reconciles what lands — FIFO, overnight, every night.
            </motion.p>

            {/* Nightly run ledger */}
            <motion.div
              className="border border-[#C4B8A8] bg-[#EDE8E0] mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#C4B8A8]/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-live-pulse" />
                <span className="text-label text-[#878074]">Last night{"’"}s run</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#C4B8A8]/60">
                {nightlyRun.map((row) => (
                  <div key={row.action} className="px-4 py-4">
                    <p className="font-mono text-lg sm:text-xl font-bold tabular text-[#0D0D0D]">
                      {row.count}
                    </p>
                    <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#878074] mt-1">
                      {row.action}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href={ASVA.home}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] text-label hover:from-[#E04A12] hover:to-[#FF5A1F] transition-colors duration-300 group magnetic-hover"
              >
                Visit tryasva.com
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <a
                href={ASVA.howItWorks}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 border border-[#C4B8A8] text-[#0D0D0D] text-label hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 transition-colors duration-300"
              >
                See how it works
              </a>
            </motion.div>
          </div>

          {/* Right — the numbers */}
          <MetricGrid metrics={metrics} tone="light" className="content-center" />
        </div>
      </div>
    </section>
  );
}
