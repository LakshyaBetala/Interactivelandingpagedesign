"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    number: string;
    title: string;
    subtitle: string;
    description: string;
    details: string[];
    techStack: string[];
    deliverables: string[];
  } | null;
}

export default function ServiceDrawer({ isOpen, onClose, service }: ServiceDrawerProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#0D0D0D]/60 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-[#0D0D0D] z-[101] overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[#A49D93] hover:text-[#FF5A1F] transition-colors duration-300 z-10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>

            <div className="p-8 lg:p-12 pt-20">
              {/* Section label */}
              <motion.p
                className="text-label text-[#FF5A1F] mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {service.number} — {service.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h3
                className="font-display text-4xl lg:text-5xl font-bold text-[#E6DFD5] tracking-tight mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {service.title}
              </motion.h3>

              {/* Description */}
              <motion.p
                className="text-[#A49D93] text-lg leading-relaxed mb-12"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {service.description}
              </motion.p>

              {/* Divider */}
              <motion.div
                className="w-full h-[1px] bg-[#3A3632] mb-10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
              />

              {/* What We Do */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="text-label text-[#878074] mb-5">What We Do</h4>
                <div className="flex flex-col gap-3">
                  {service.details.map((detail, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.06 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] mt-2 flex-shrink-0" />
                      <span className="text-[#D9CFC2] text-sm leading-relaxed">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Tech Stack */}
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <h4 className="text-label text-[#878074] mb-5">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {service.techStack.map((tech, i) => (
                    <motion.span
                      key={i}
                      className="px-3 py-1.5 text-xs font-mono text-[#A49D93] border border-[#3A3632] hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors duration-300 cursor-default"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.04, type: "spring", stiffness: 200 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Deliverables */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <h4 className="text-label text-[#878074] mb-5">Deliverables</h4>
                <div className="grid grid-cols-2 gap-3">
                  {service.deliverables.map((item, i) => (
                    <motion.div
                      key={i}
                      className="px-4 py-3 bg-[#1A1A1A] border border-[#252525] text-[#D9CFC2] text-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.a
                href="#contact"
                onClick={onClose}
                className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] text-label hover:from-[#E04A12] hover:to-[#FF5A1F] transition-all duration-300 group magnetic-hover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Discuss this service
                <span className="inline-block w-0 group-hover:w-6 h-[1px] bg-[#E6DFD5] transition-all duration-300" />
              </motion.a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
