"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const CELL_WORDS = [
  "SYS_CTRL", "NODE_0X", "AWAIT", "RAG_DB", "API_GW", "LLM_WK", 
  "PRC_99", "LAT_5MS", "VOICE_TX", "SOCKET_O", "MEM_LOK", "AUTH_KEY",
  "ALM_TX", "DAT_SYN", "COR_REQ", "Z_TRUST", "WHT_APP", "REQ_50"
];

function GridCell({ index }: { index: number }) {
  const [word, setWord] = useState("0000");

  useEffect(() => {
    // Deterministic random to avoid hydration errors or just hydration safety
    setWord(CELL_WORDS[(index * 7) % CELL_WORDS.length]);
  }, [index]);

  return (
    <div className="relative group flex items-center justify-center p-4 border-[0.5px] border-[#878074]/10 hover:border-[#FF5A1F]/50 hover:bg-[#FF5A1F]/5 transition-all duration-300 cursor-crosshair">
       <span className="font-mono text-[10px] sm:text-xs text-[#878074]/30 group-hover:text-[#FF5A1F] transition-colors duration-300 pointer-events-none select-none tracking-widest">
         {word}
       </span>
       
       {/* High-tech crosshairs in corners */}
       <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#878074]/20 group-hover:border-[#FF5A1F] transition-colors duration-300" />
       <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#878074]/20 group-hover:border-[#FF5A1F] transition-colors duration-300" />
       <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#878074]/20 group-hover:border-[#FF5A1F] transition-colors duration-300" />
       <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#878074]/20 group-hover:border-[#FF5A1F] transition-colors duration-300" />
    </div>
  );
}

export default function KineticArchitecturalGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end center"]
  });

  // Intense architectural parallax
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 45]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.8, 0]);

  // Generate a large grid
  const cells = Array.from({ length: 144 }); // 12x12

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center" style={{ perspective: "1200px" }}>
      <motion.div 
        style={{ y, rotateX, scale, opacity }}
        className="w-[150vw] h-[150vh] flex flex-wrap pointer-events-auto origin-center"
      >
        <div className="grid grid-cols-8 sm:grid-cols-12 w-full h-full">
            {cells.map((_, i) => (
            <GridCell key={i} index={i} />
            ))}
        </div>
      </motion.div>
      
      {/* Heavy vignette to blend edges smoothly into the background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#E6DFD5_85%)] pointer-events-none" />
    </div>
  );
}
