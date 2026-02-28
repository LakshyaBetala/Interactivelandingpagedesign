'use client';

import { useScroll, useTransform, useSpring, motion } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import almmatixLogo from 'figma:asset/9f66af9a8c38263c3dbbfb332de9ffec52c9597f.png';
import vasooliBhaiChar from 'figma:asset/891e09c6a6381f3f64481361d29b7cfdac7c660b.png';
import doitformeLogo from 'figma:asset/213c69d80a583700c9434db2544b8ff8b532d32f.png';

export default function Home() {
  const navigate = useNavigate();
  const hookRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking for the hook section only
  const { scrollYProgress } = useScroll({
    target: hookRef,
    offset: ['start start', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001
  });

  // ==================== PHASE 1: ALMMATIX (0 → 0.33) ====================
  const phase1Opacity = useTransform(smoothProgress, [0, 0.1, 0.3, 0.33], [0, 1, 1, 0]);
  const phase1LogoScale = useTransform(smoothProgress, [0, 0.15, 0.3], [0.6, 1, 0.9]);
  const phase1LogoRotate = useTransform(smoothProgress, [0, 0.15], [90, 0]);
  const phase1TextOpacity = useTransform(smoothProgress, [0.1, 0.18, 0.3, 0.33], [0, 1, 1, 0]);
  const phase1BgOpacity = useTransform(smoothProgress, [0, 0.15, 0.3, 0.35], [0, 0.5, 0.5, 0]);

  // ==================== PHASE 2: VASOOLI BHAI (0.33 → 0.66) ====================
  const phase2Opacity = useTransform(smoothProgress, [0.3, 0.38, 0.63, 0.66], [0, 1, 1, 0]);
  const phase2CharScale = useTransform(smoothProgress, [0.33, 0.42], [0.5, 1]);
  const phase2CharX = useTransform(smoothProgress, [0.33, 0.42], [-100, 0]);
  const phase2TextOpacity = useTransform(smoothProgress, [0.4, 0.46, 0.63, 0.66], [0, 1, 1, 0]);
  const phase2CardOpacity = useTransform(smoothProgress, [0.44, 0.5, 0.63, 0.66], [0, 1, 1, 0]);
  const phase2CardY = useTransform(smoothProgress, [0.44, 0.5], [80, 0]);
  const phase2BgOpacity = useTransform(smoothProgress, [0.3, 0.38, 0.63, 0.68], [0, 0.6, 0.6, 0]);

  // Flash effect between phases
  const flashGreen = useTransform(smoothProgress, [0.32, 0.34, 0.36], [0, 0.3, 0]);

  // ==================== PHASE 3: DOITFORME (0.66 → 1) ====================
  const phase3Opacity = useTransform(smoothProgress, [0.63, 0.7, 1], [0, 1, 1]);
  const phase3LogoScale = useTransform(smoothProgress, [0.66, 0.75], [1.2, 1]);
  const phase3LogoY = useTransform(smoothProgress, [0.66, 0.75], [-100, -60]);
  const phase3TextOpacity = useTransform(smoothProgress, [0.72, 0.78, 1], [0, 1, 1]);
  const phase3CtaOpacity = useTransform(smoothProgress, [0.8, 0.86, 1], [0, 1, 1]);
  const phase3CtaScale = useTransform(smoothProgress, [0.8, 0.86], [0.9, 1]);
  const phase3BgOpacity = useTransform(smoothProgress, [0.63, 0.7, 1], [0, 0.7, 0.7]);

  const flashPurple = useTransform(smoothProgress, [0.64, 0.66, 0.68], [0, 0.3, 0]);

  return (
    <div className="relative w-full bg-black">
      {/* Film grain noise */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* ============================================ */}
      {/* PART 1: THE CRED-STYLE HOOK (250vh) */}
      {/* ============================================ */}
      <div ref={hookRef} className="relative h-[250vh]">
        
        {/* Sticky viewport - animations happen here */}
        <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden">

          {/* Background layers */}
          <motion.div
            style={{ opacity: phase1BgOpacity }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_#ff6b35_0%,_#f7931e_30%,_transparent_65%)]"
          />
          
          <motion.div
            style={{ opacity: phase2BgOpacity }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_#00ff87_0%,_#00ff41_35%,_transparent_60%)]"
          />
          
          <motion.div
            style={{ opacity: phase3BgOpacity }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,_#667eea_0%,_#764ba2_40%,_transparent_68%)]"
          />

          {/* Flash transitions */}
          <motion.div
            style={{ opacity: flashGreen }}
            className="absolute inset-0 bg-green-400 mix-blend-screen"
          />
          <motion.div
            style={{ opacity: flashPurple }}
            className="absolute inset-0 bg-purple-500 mix-blend-screen"
          />

          {/* =============== PHASE 1: ALMMATIX =============== */}
          <motion.div
            style={{ opacity: phase1Opacity }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              style={{
                scale: phase1LogoScale,
                rotateZ: phase1LogoRotate,
              }}
              className="relative w-[380px] h-[380px] flex items-center justify-center mb-8"
            >
              <div className="absolute inset-0 blur-[100px] bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 opacity-70" />
              <img
                src={almmatixLogo}
                alt="Almmatix"
                className="relative w-full h-full object-contain"
                style={{ 
                  filter: 'brightness(1.4) contrast(1.2) drop-shadow(0 0 80px rgba(255,107,53,0.9))',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>

            <motion.div
              style={{ opacity: phase1TextOpacity }}
              className="text-center"
            >
              <h1 className="text-7xl font-black tracking-[-0.04em] uppercase mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-300 via-red-400 to-pink-400">
                  ALMMATIX
                </span>
              </h1>
              <p className="text-3xl tracking-[0.15em] text-white/80 font-light">
                The Student Ecosystem.
              </p>
            </motion.div>
          </motion.div>

          {/* =============== PHASE 2: VASOOLI BHAI =============== */}
          <motion.div
            style={{ opacity: phase2Opacity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex items-center gap-16 max-w-7xl px-8">
              {/* Character */}
              <motion.div
                style={{
                  scale: phase2CharScale,
                  x: phase2CharX,
                }}
                className="relative w-[420px] h-[420px] flex items-center justify-center"
              >
                <motion.div 
                  className="absolute inset-0 blur-[120px] bg-gradient-to-br from-green-400 via-emerald-500 to-lime-400"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.9, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <img
                  src={vasooliBhaiChar}
                  alt="Vasooli Bhai"
                  className="relative w-full h-full object-contain"
                  style={{ filter: 'brightness(1.3) saturate(1.4) drop-shadow(0 0 120px rgba(0,255,135,1))' }}
                />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <motion.div
                  style={{ opacity: phase2TextOpacity }}
                >
                  <h2 className="text-6xl font-black tracking-[-0.04em] uppercase mb-6 leading-none">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300">
                      Get your money back.<br />No awkwardness.
                    </span>
                  </h2>
                </motion.div>

                {/* Invoice card */}
                <motion.div
                  style={{
                    opacity: phase2CardOpacity,
                    y: phase2CardY,
                  }}
                  className="relative w-80 h-64"
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-3xl blur-xl opacity-80" />
                  <div className="relative h-full bg-black/50 backdrop-blur-2xl border-2 border-green-400/40 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-green-400/70 uppercase tracking-[0.15em] font-bold mb-1">Invoice #INV-2024-045</div>
                      <div className="text-sm text-green-300 font-mono">Client: Acme Corp</div>
                    </div>
                    <div>
                      <div className="text-6xl font-black text-green-200 mb-3">₹92,000</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-red-400 font-bold uppercase">45 DAYS OVERDUE</div>
                        <div className="px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full">
                          <span className="text-xs text-green-300 font-bold uppercase">✓ CLEARED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* =============== PHASE 3: DOITFORME =============== */}
          <motion.div
            style={{ opacity: phase3Opacity }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              style={{
                scale: phase3LogoScale,
                y: phase3LogoY,
              }}
              className="relative w-[420px] h-[420px] flex items-center justify-center mb-6"
            >
              <div className="absolute inset-0 blur-[140px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-70" />
              <img
                src={doitformeLogo}
                alt="DoItForMe"
                className="relative w-full h-full object-contain"
                style={{ 
                  filter: 'brightness(1.3) saturate(1.2) drop-shadow(0 0 100px rgba(139,92,246,1))',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>

            <motion.div
              style={{ opacity: phase3TextOpacity }}
              className="text-center mb-12"
            >
              <h2 className="text-7xl font-black tracking-[-0.05em] uppercase mb-4 leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  Hustle on campus.
                </span>
              </h2>
              <p className="text-2xl tracking-[0.2em] text-purple-200/80 font-light">
                Buy, sell, rent.
              </p>
            </motion.div>

            <motion.div
              style={{
                opacity: phase3CtaOpacity,
                scale: phase3CtaScale,
              }}
            >
              <a
                href="https://www.doitforme.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block"
              >
                <motion.div 
                  className="absolute inset-0 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #4f46e5)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative px-20 py-7 bg-black/90 backdrop-blur-xl border-2 border-purple-400/60 rounded-full group-hover:border-purple-300 transition-all">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                  />
                  <span className="relative text-4xl font-black uppercase tracking-[-0.02em] bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                    ENTER MARKETPLACE
                  </span>
                </div>
              </a>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* ============================================ */}
      {/* PART 2: THE CONTENT PAYLOAD (Normal Scroll) */}
      {/* ============================================ */}
      
      <div className="relative bg-black">
        
        {/* Section 1: The Almmatix Engine - Bento Grid */}
        <section className="relative py-32 px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-7xl mx-auto mb-16 text-center"
          >
            <h2 className="text-6xl font-black tracking-[-0.04em] uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              The Almmatix Engine
            </h2>
            <p className="text-xl text-white/50 tracking-wide max-w-3xl mx-auto">
              Not just a pretty UI. A robust financial infrastructure built for students, by students.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Card 1: Large - Secure Escrow */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="md:col-span-7 md:row-span-2 group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative h-full min-h-[400px] bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.15em] text-blue-300 font-bold">Core Infrastructure</span>
                  </div>
                  <h3 className="text-5xl font-black tracking-tight mb-4 text-white">
                    Secure Escrow Engine
                  </h3>
                  <p className="text-lg text-white/60 leading-relaxed max-w-xl">
                    Money moves only when both parties agree. Custom Wallet API ensures funds are locked safely between users until delivery is confirmed.
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-8">
                  <div className="flex-1 h-32 bg-gradient-to-r from-blue-500/20 to-transparent rounded-2xl border border-blue-400/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider font-bold">Locked</div>
                    </div>
                  </div>
                  <div className="text-3xl text-white/40">→</div>
                  <div className="flex-1 h-32 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl border border-green-400/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">✓</div>
                      <div className="text-xs text-green-300 uppercase tracking-wider font-bold">Released</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Medium - Real-Time Resolution */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:col-span-5 group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative h-full min-h-[240px] bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between">
                <div>
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-3xl font-black tracking-tight mb-3 text-white">
                    Real-Time Resolution
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Automated dispute flagging and chat moderation keeps transactions smooth and fair.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Medium - Instant Payouts */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="md:col-span-5 group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative h-full min-h-[240px] bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between">
                <div>
                  <div className="text-5xl mb-4">💸</div>
                  <h3 className="text-3xl font-black tracking-tight mb-3 text-white">
                    Instant Payouts
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Direct UPI integration means your money lands in your account instantly. No waiting, no hassle.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-green-500/10 border border-green-400/30 rounded-full text-xs text-green-300 font-bold">UPI</div>
                  <div className="px-4 py-2 bg-green-500/10 border border-green-400/30 rounded-full text-xs text-green-300 font-bold">Real-Time</div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Section 2: Deep Dive - Vasooli Bhai */}
        <section className="relative py-32 px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00ff87_0%,_transparent_50%)] opacity-5" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              
              {/* Left: Visual */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-[3rem] blur-3xl opacity-50" />
                <div className="relative bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-green-400/20 rounded-[3rem] p-12 overflow-hidden">
                  {/* Mock Dashboard */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                      <h4 className="text-2xl font-black text-white">Vasooli Dashboard</h4>
                      <div className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
                        <span className="text-xs text-green-300 font-bold uppercase">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div>
                          <div className="text-sm text-white/50">Outstanding</div>
                          <div className="text-2xl font-black text-white">₹2.4L</div>
                        </div>
                        <div className="text-2xl">📊</div>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-400/30 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-green-300 font-bold">Invoice #045</div>
                          <div className="text-xs text-red-400 uppercase font-bold">45d Overdue</div>
                        </div>
                        <div className="text-3xl font-black text-white mb-4">₹92,000</div>
                        <button className="w-full px-6 py-4 bg-green-500 hover:bg-green-400 transition-colors rounded-xl text-black font-black uppercase tracking-tight flex items-center justify-center gap-2">
                          <span>Trigger Reminder</span>
                          <span className="text-xl">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Content */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-green-500/10 border border-green-400/30 rounded-full mb-6">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm uppercase tracking-[0.15em] text-green-300 font-bold">Payment Recovery</span>
                </div>
                
                <h2 className="text-6xl font-black tracking-[-0.04em] uppercase mb-6 leading-none">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300">
                    Aggressive on payments.<br />Effortless for you.
                  </span>
                </h2>
                
                <p className="text-xl text-white/60 leading-relaxed mb-8">
                  Generate payment links, track deadbeats, and automate recovery so you can focus on the work that matters.
                </p>

                <div className="space-y-4 mb-10">
                  {[
                    'One-click reminder sequences',
                    'Auto-escalation based on time',
                    'Multi-channel reach (Email, SMS, WhatsApp)',
                    'Real-time payment tracking'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <span className="text-lg text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/vasooli-bhai')}
                  className="group relative inline-flex items-center gap-3 px-10 py-5 bg-green-500 hover:bg-green-400 transition-all rounded-full overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  />
                  <span className="relative text-xl font-black uppercase tracking-tight text-black">
                    Explore Vasooli Bhai
                  </span>
                  <span className="relative text-2xl text-black">→</span>
                </button>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Section 3: Deep Dive - DoItForMe */}
        <section className="relative py-32 px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#764ba2_0%,_transparent_50%)] opacity-5" />
          
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-purple-500/10 border border-purple-400/30 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm uppercase tracking-[0.15em] text-purple-300 font-bold">Gig Marketplace</span>
              </div>
              
              <h2 className="text-6xl font-black tracking-[-0.04em] uppercase mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                  DoItForMe
                </span>
              </h2>
              
              <p className="text-3xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-6 font-light">
                Got your money back? Good. Now spend it, or make more.
              </p>

              <p className="text-lg text-white/40">
                Student-to-student verification. Zero BS negotiation. Peer reviews that matter.
              </p>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                { icon: '💻', title: 'Code', desc: 'Full-stack devs, API wizards, and debugging heroes', color: 'indigo' },
                { icon: '🎨', title: 'Design', desc: 'UI/UX magic, brand identities, and pixel perfection', color: 'purple' },
                { icon: '🚀', title: 'Hustle', desc: 'Content writing, social media, and growth hacking', color: 'pink' }
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute -inset-1 bg-gradient-to-br from-${cat.color}-500/20 to-${cat.color}-600/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative h-full min-h-[280px] bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-xl border border-white/10 group-hover:border-white/20 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-all">
                    <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <h3 className="text-3xl font-black uppercase mb-3 text-white">{cat.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{cat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <a
                href="https://www.doitforme.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3"
              >
                <motion.div 
                  className="absolute inset-0 blur-3xl opacity-70 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #4f46e5)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative px-16 py-6 bg-black/90 backdrop-blur-xl border-2 border-purple-400/60 group-hover:border-purple-300 rounded-full transition-all">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                  />
                  <span className="relative text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                    Browse Marketplace →
                  </span>
                </div>
              </a>
            </motion.div>

          </div>
        </section>

        {/* Section 4: Unified Footer & CTA */}
        <section className="relative py-32 px-8">
          <div className="max-w-7xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-8xl font-black tracking-[-0.06em] uppercase mb-8 leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-green-400 to-purple-400">
                  One Identity.<br />Infinite Hustle.
                </span>
              </h2>
            </motion.div>

            {/* Split CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 justify-center items-center mb-24"
            >
              <button
                onClick={() => navigate('/vasooli-bhai')}
                className="group relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-12 py-5 bg-green-500 hover:bg-green-400 transition-colors rounded-full">
                  <span className="text-2xl font-black uppercase tracking-tight text-black">
                    Trigger a Vasooli
                  </span>
                </div>
              </button>

              <a
                href="https://www.doitforme.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-12 py-5 bg-black border-2 border-purple-400/60 hover:border-purple-300 transition-colors rounded-full backdrop-blur-xl">
                  <span className="text-2xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                    Browse Gigs
                  </span>
                </div>
              </a>
            </motion.div>

            {/* Footer Links */}
            <div className="border-t border-white/10 pt-12">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    ALMMATIX
                  </div>
                  <div className="text-sm text-white/40">The Student OS</div>
                </div>

                <div className="flex gap-8 text-sm text-white/50">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>

                <div className="text-sm text-white/40">
                  © 2026 Almmatix. Built with ❤️ by students.
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}