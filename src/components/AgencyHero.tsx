"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

/* Orbiting particle for the hero */
function OrbitParticle({ delay, duration, size, radius }: { delay: number; duration: number; size: number; radius: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-[#FF5A1F]"
      style={{
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      <motion.div
        className="absolute bg-[#FF5A1F] rounded-full"
        style={{
          width: size,
          height: size,
          left: radius,
        }}
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: duration / 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

export default function AgencyHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 0.3], ["0%", "100%"]);
  const headingY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-20%"]);
  const headingOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const logoOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0.07, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100svh] flex flex-col justify-end bg-[#E6DFD5] overflow-hidden pb-16 lg:pb-24 pt-24"
    >
      {/* Background: Floating Almmatix logo mark — the "wow" element */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] pointer-events-none select-none"
        style={{ scale: logoScale, opacity: logoOpacity }}
      >
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 1, 0, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/almmatix_logo.png"
            alt=""
            width={500}
            height={500}
            className="w-[40vw] max-w-[500px] h-auto"
            priority
          />
        </motion.div>

        {/* Orbiting particles around the logo */}
        <OrbitParticle delay={0} duration={12} size={4} radius={150} />
        <OrbitParticle delay={3} duration={16} size={3} radius={200} />
        <OrbitParticle delay={6} duration={20} size={5} radius={250} />
      </motion.div>

      {/* Ember accent line */}
      <motion.div
        style={{ width: lineWidth }}
        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47]"
      />

      {/* Content */}
      <motion.div
        style={{ y: headingY, opacity: headingOpacity }}
        className="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12"
      >
        <div className="stagger-children mb-12">
          <p className="text-label text-[#878074]">
            Deep-Tech Infrastructure Studio
          </p>
        </div>

        <div className="stagger-children">
          <h1 className="font-display text-massive text-[#0D0D0D]">
            We build the
          </h1>
          <h1 className="font-display text-massive text-[#0D0D0D]">
            infrastructure.
          </h1>
          <h1 className="font-display text-massive text-[#FF5A1F]">
            You scale.
          </h1>
        </div>

        <div className="mt-12 lg:mt-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <p
            className="font-sans text-[#878074] text-lg lg:text-xl max-w-lg leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.7s", animationFillMode: "both" }}
          >
            Voice agents. WhatsApp automation. AI systems. Web platforms.
            Engineered for enterprises that refuse to stay manual.
          </p>
          <a
            href="#services"
            className="inline-flex items-center gap-3 text-label text-[#0D0D0D] group animate-fade-up"
            style={{ animationDelay: "0.9s", animationFillMode: "both" }}
          >
            <span>Explore services</span>
            <span className="inline-block w-8 h-[1px] bg-[#0D0D0D] group-hover:w-16 transition-all duration-500" />
          </a>
        </div>
      </motion.div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#0D0D0D]/8" />

      {/* Scrolling Marquee Strip — the "wow" detail */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden py-3 border-t border-[#0D0D0D]/5">
        <motion.div
          className="flex whitespace-nowrap gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).map((_, setIdx) => (
            <div key={setIdx} className="flex gap-16">
              {["Voice AI", "WhatsApp Bots", "RAG Systems", "Web Platforms", "Data Pipelines", "CRM Integration", "Custom Dashboards", "API Engineering"].map((item, i) => (
                <span
                  key={`${setIdx}-${i}`}
                  className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C4B8A8]"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
