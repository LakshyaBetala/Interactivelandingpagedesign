"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOOK_A_CALL, whatsappLink } from "@/lib/links";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  "Voice AI",
  "WhatsApp Automation",
  "Integrations & Workflows",
  "RAG Systems",
  "Custom Web Platforms",
  "Other / General Inquiry",
];

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  // Freeze the page behind the modal and wire up Escape to dismiss.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelect = (service: string) => {
    window.open(whatsappLink(`Hi Almmatix, I am interested in ${service}.`), "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[#0D0D0D]/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-modal-title"
              className="bg-[#E6DFD5] w-full max-w-lg max-h-[85vh] overflow-y-auto overscroll-contain shadow-2xl p-8 lg:p-12 border border-[#C4B8A8]/30 pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 id="lead-modal-title" className="font-display text-4xl font-bold text-[#0D0D0D] tracking-tight mb-2">
                    Let{"’"}s talk.
                  </h3>
                  <p className="text-[#878074] font-sans">
                    Pick a time that works, or message us on WhatsApp about a
                    specific service.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#878074] hover:text-[#0D0D0D] transition-colors p-2 -mr-2 -mt-2"
                  aria-label="Close modal"
                >
                  <svg
                    aria-hidden="true"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Primary path: book a call */}
              <motion.a
                href={BOOK_A_CALL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between w-full p-5 mb-6 bg-gradient-to-r from-[#FF5A1F] to-[#FF7A47] text-[#E6DFD5] hover:from-[#E04A12] hover:to-[#FF5A1F] transition-all duration-300"
              >
                <span className="flex flex-col">
                  <span className="font-sans font-semibold">Book a 15-Minute Call</span>
                  <span className="text-xs opacity-80 font-mono tracking-wide">
                    cal.com/almmatix
                  </span>
                </span>
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth="2"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </motion.a>

              <div className="flex items-center gap-4 mb-6">
                <span className="h-px flex-1 bg-[#C4B8A8]/50" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#878074]">
                  or ping us on WhatsApp
                </span>
                <span className="h-px flex-1 bg-[#C4B8A8]/50" />
              </div>

              <div className="flex flex-col gap-3">
                {SERVICES.map((service, index) => (
                  <motion.button
                    key={service}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    onClick={() => handleSelect(service)}
                    className="group relative flex items-center justify-between w-full p-4 bg-[#F2EDE7] hover:bg-[#0D0D0D] border border-[#C4B8A8]/20 transition-colors duration-300 text-left"
                  >
                    <span className="font-sans font-medium text-[#0D0D0D] group-hover:text-[#E6DFD5] transition-colors duration-300">
                      {service}
                    </span>
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-[#878074] group-hover:text-[#FF5A1F] transform group-hover:translate-x-1 transition-[color,transform] duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth="2"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
