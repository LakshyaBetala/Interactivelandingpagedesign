"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProductShowcase() {
  return (
    <section className="relative w-full bg-[#020202] py-40 px-6 lg:px-12 flex items-center justify-center overflow-hidden border-t border-white/5">
      
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-16 lg:gap-24 items-center z-10">
        
        {/* Story Side */}
        <div className="flex-1 flex flex-col text-left">
          <div className="font-mono text-[#00F0FF] text-[10px] tracking-[0.2em] uppercase mb-8">
            [ Infrastructure Proof ]
          </div>
          
          <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-white mb-8 leading-[1.1]">
            Case Study: <span className="text-zinc-500">DoItForMe.in</span>
          </h2>
          
          <p className="font-sans text-zinc-400 text-lg md:text-xl leading-relaxed font-normal mb-10 max-w-xl">
            A zero-trust student gig marketplace infrastructure engineered by our team. Features built-in escrow payment routing, verified user gating, and algorithmic matching at scale.
          </p>

          <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-mono uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-colors duration-300 w-max">
            Initialize Review
          </button>
        </div>

        {/* 3D Wireframe / Dashboard Side */}
        <div className="flex-1 relative w-full aspect-square lg:aspect-[4/3] flex items-center justify-center perspective-1000">
          <motion.div 
            initial={{ rotateX: 20, rotateY: -15, scale: 0.9 }}
            whileInView={{ rotateX: 10, rotateY: -10, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg lg:max-w-xl h-[80%] bg-zinc-950/50 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(79,70,229,0.1)] relative overflow-hidden flex flex-col"
          >
            {/* Minimalist Dashboard Header */}
            <div className="w-full h-12 border-b border-white/5 flex items-center px-6 gap-3">
               <div className="w-2 h-2 bg-zinc-800 rounded-full" />
               <div className="w-2 h-2 bg-zinc-800 rounded-full" />
               <div className="w-2 h-2 bg-zinc-800 rounded-full" />
               <div className="flex-1" />
               <div className="font-mono text-[8px] text-zinc-600 block uppercase tracking-widest">
                  doitforme.in/dashboard
               </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-6 grid grid-cols-3 gap-6">
              <div className="col-span-1 border-r border-white/5 pr-6 flex flex-col gap-4">
                 <div className="w-full h-8 bg-white/5 rounded-sm" />
                 <div className="w-2/3 h-4 bg-white/5 rounded-sm" />
                 <div className="w-3/4 h-4 bg-white/5 rounded-sm" />
              </div>
              <div className="col-span-2 flex flex-col gap-6">
                 {/* Graph abstract */}
                 <div className="w-full h-32 bg-white/5 rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-10 w-px h-full bg-[#00F0FF]/20" />
                    <div className="absolute top-0 left-20 w-px h-full bg-[#00F0FF]/20" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00F0FF]/30" />
                    <div className="absolute bottom-[20%] left-0 w-[40%] h-[1px] bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                    <div className="absolute bottom-[50%] left-[40%] w-[60%] h-[1px] bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                    <div className="absolute bottom-[20%] left-[40%] w-[1px] h-[30%] bg-[#00F0FF]" />
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 h-20 bg-white/5 rounded-sm" />
                    <div className="flex-1 h-20 bg-white/5 rounded-sm" />
                 </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}
