"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

export interface MetricSpec {
  /** Rendered before the number, e.g. "₹". */
  prefix?: string;
  /** The raw number — counted up on scroll and grouped with Intl. */
  value: number;
  /** Rendered after the number, e.g. "L+", "%", "+". */
  suffix?: string;
  /** Short caption under the number. */
  label: string;
  /** Optional second line for units or context. */
  note?: string;
}

const DURATION = 1400;
// easeOutExpo — fast start, long settle, so the final digits are readable.
const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Indian digit grouping: 1,400 / 36,650 — matches the audience these numbers describe. */
const format = (n: number) => new Intl.NumberFormat("en-IN").format(n);

function useCountUp(target: number, active: boolean) {
  const reduceMotion = useReducedMotion();
  // Seed with the real number so the server-rendered HTML carries it — crawlers
  // and no-JS readers must never see "₹0L+".
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    let raf = 0;

    if (reduceMotion) {
      raf = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(raf);
    }

    if (!active) {
      // Below the fold on the client — zero it out so the count-up has a runway.
      raf = requestAnimationFrame(() => setDisplay(0));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setDisplay(Math.round(target * ease(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, reduceMotion]);

  return display;
}

export function Metric({
  metric,
  index = 0,
  tone = "dark",
}: {
  metric: MetricSpec;
  index?: number;
  tone?: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const display = useCountUp(metric.value, isInView);

  const isDark = tone === "dark";

  return (
    <motion.div
      ref={ref}
      className={`border-t pt-5 sm:pt-6 ${isDark ? "border-[#3A3632]" : "border-[#C4B8A8]"}`}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <p
        className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight tabular ${
          isDark ? "text-[#E6DFD5]" : "text-[#0D0D0D]"
        }`}
      >
        {metric.prefix}
        {format(display)}
        {metric.suffix}
      </p>
      <p className={`text-label mt-2 ${isDark ? "text-[#878074]" : "text-[#878074]"}`}>
        {metric.label}
      </p>
      {metric.note && (
        <p className={`text-xs mt-1.5 leading-snug ${isDark ? "text-[#A49D93]/70" : "text-[#878074]/80"}`}>
          {metric.note}
        </p>
      )}
    </motion.div>
  );
}

export function MetricGrid({
  metrics,
  tone = "dark",
  className = "",
}: {
  metrics: MetricSpec[];
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-6 sm:gap-8 lg:gap-10 ${className}`}>
      {metrics.map((metric, i) => (
        <Metric key={metric.label} metric={metric} index={i} tone={tone} />
      ))}
    </div>
  );
}
