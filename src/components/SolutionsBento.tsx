"use client";

import React, { useRef, useState } from "react";
import { Mic, MessageSquare, Workflow, BrainCircuit, Globe } from "lucide-react";

interface CardProps {
  title: string;
  body: string;
  className?: string;
  icon: React.ReactNode;
  hasDots?: boolean;
}

const BentoCard = ({ title, body, className = "", icon, hasDots }: CardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden bg-white/[0.02] backdrop-blur-[20px] border border-white/5 group p-8 md:p-12 flex flex-col justify-between transition-colors hover:border-white/10 ${className}`}
    >
      {/* Dot Matrix Pattern */}
      {hasDots && (
        <div className="absolute inset-0 bg-dot-matrix opacity-20 pointer-events-none" />
      )}

      {/* Mouse Tracking Radial Glow (Indigo) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(79, 70, 229, 0.15), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full items-start">
        <div className="text-zinc-500 mb-8 group-hover:text-[#00F0FF] transition-colors duration-500">
          {icon}
        </div>
        
        <div className="mt-auto">
          <div className="font-mono text-[#4F46E5] text-xs tracking-widest uppercase mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {title}
          </div>
          <p className="font-sans text-zinc-300 leading-relaxed text-lg md:text-xl font-normal max-w-sm group-hover:text-white transition-colors duration-500">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SolutionsBento() {
  return (
    <section className="relative w-full bg-[#020202] py-40 px-6 lg:px-12 flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        <div className="mb-24 flex flex-col gap-6">
          <div className="font-mono text-[#00F0FF] text-xs tracking-[0.2em] uppercase">
            [ Core Architecture ]
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter text-white leading-none">
            Infrastructure as a<br/>
            <span className="text-zinc-600">Deterministic Engine.</span>
          </h2>
        </div>
        
        {/* Asymmetrical High-Space Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-[minmax(350px,auto)]">
          <BentoCard 
            title="Voice Operations" 
            body="Deploy 24/7 human-like voice agents for inbound routing and outbound sales."
            icon={<Mic size={32} strokeWidth={1.5} />}
            className="lg:col-span-8 rounded-tl-[2rem]"
            hasDots
          />
          
          <BentoCard 
            title="WhatsApp Protocol" 
            body="Automate lead qualification and omnichannel support across India, LatAm, and Europe."
            icon={<MessageSquare size={32} strokeWidth={1.5} />}
            className="lg:col-span-4 rounded-tr-[2rem]"
          />

          <BentoCard 
            title="Internal Workflows" 
            body="Connect CRMs and ERPs with LLM-powered logic to eliminate manual data entry."
            icon={<Workflow size={32} strokeWidth={1.5} />}
            className="lg:col-span-4"
          />
          
          <BentoCard 
            title="RAG Systems" 
            body="Secure, hallucination-free AI assistants trained exclusively on proprietary data."
            icon={<BrainCircuit size={32} strokeWidth={1.5} />}
            className="lg:col-span-4"
            hasDots
          />

          <BentoCard 
            title="Web Platforms" 
            body="High-converting, AI-integrated digital storefronts."
            icon={<Globe size={32} strokeWidth={1.5} />}
            className="lg:col-span-4 rounded-br-[2rem]"
          />
        </div>
      </div>
    </section>
  );
}
