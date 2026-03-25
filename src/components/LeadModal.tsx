"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES = [
  "Voice AI",
  "WhatsApp Automation",
  "RAG Systems",
  "Custom Web Platforms",
  "Data Pipelines",
  "Other / General Inquiry",
];

const WHATSAPP_NUMBER = "919344110272";

export default function LeadModal({ isOpen, onClose }: LeadModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (service: string) => {
    const text = encodeURIComponent(`Hi Almmatix, I am interested in ${service}.`);
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(link, "_blank");
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
              className="bg-[#E6DFD5] w-full max-w-lg shadow-2xl p-8 lg:p-12 border border-[#C4B8A8]/30 pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-display text-4xl font-bold text-[#0D0D0D] tracking-tight mb-2">
                    Let's talk.
                  </h3>
                  <p className="text-[#878074] font-sans">
                    Select a service to start a conversation with us on WhatsApp.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#878074] hover:text-[#0D0D0D] transition-colors p-2 -mr-2 -mt-2"
                  aria-label="Close modal"
                >
                  <svg
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

              <div className="flex flex-col gap-3">
                {SERVICES.map((service, index) => (
                  <motion.button
                    key={service}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    onClick={() => handleSelect(service)}
                    className="group relative flex items-center justify-between w-full p-4 bg-[#F2EDE7] hover:bg-[#0D0D0D] border border-[#C4B8A8]/20 transition-all duration-300 text-left"
                  >
                    <span className="font-sans font-medium text-[#0D0D0D] group-hover:text-[#E6DFD5] transition-colors duration-300">
                      {service}
                    </span>
                    <svg
                      className="w-5 h-5 text-[#878074] group-hover:text-[#FF5A1F] transform group-hover:translate-x-1 transition-all duration-300"
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
