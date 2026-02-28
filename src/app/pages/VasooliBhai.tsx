'use client';

import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import vasooliBhaiChar from 'figma:asset/891e09c6a6381f3f64481361d29b7cfdac7c660b.png';

export default function VasooliBhai() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.12] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="5"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Animated Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_#00ff87_0%,_#00ff41_20%,_transparent_50%)] opacity-20" />
      
      <motion.div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_#10b981_0%,_transparent_60%)]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 z-50 group"
      >
        <div className="relative px-6 py-3 bg-black/60 backdrop-blur-xl border border-green-400/30 rounded-full hover:border-green-400/60 transition-all">
          <span className="text-green-400 font-bold uppercase tracking-wider text-sm">← Back Home</span>
        </div>
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 blur-[100px] bg-gradient-to-r from-green-400 via-emerald-500 to-lime-400 opacity-60" />
            <img
              src={vasooliBhaiChar}
              alt="Vasooli Bhai"
              className="relative w-80 h-80 object-contain drop-shadow-[0_0_100px_rgba(0,255,135,1)]"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[8rem] font-black tracking-[-0.04em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400 drop-shadow-[0_0_40px_rgba(0,255,135,0.6)] mb-6"
          >
            VASOOLI BHAI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-green-100/80 tracking-wide mb-4"
          >
            High-Utility Aggressive Invoice Recovery System
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-base text-green-300/60 uppercase tracking-[0.2em] font-medium"
          >
            Never Miss A Payment Again
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-16"
        >
          {/* Feature 1 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-full bg-black/60 backdrop-blur-2xl border border-green-400/30 rounded-3xl p-8 group-hover:border-green-400/60 transition-all">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-2xl font-black text-green-300 mb-4 uppercase tracking-tight">
                Automated Reminders
              </h3>
              <p className="text-green-100/60 leading-relaxed">
                Smart AI-powered reminder sequences that escalate based on payment behavior and history.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-lime-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-full bg-black/60 backdrop-blur-2xl border border-green-400/30 rounded-3xl p-8 group-hover:border-green-400/60 transition-all">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-black text-green-300 mb-4 uppercase tracking-tight">
                Real-Time Analytics
              </h3>
              <p className="text-green-100/60 leading-relaxed">
                Track outstanding invoices, payment trends, and recovery rates with comprehensive dashboards.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-lime-500 to-green-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="relative h-full bg-black/60 backdrop-blur-2xl border border-green-400/30 rounded-3xl p-8 group-hover:border-green-400/60 transition-all">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-2xl font-black text-green-300 mb-4 uppercase tracking-tight">
                Multi-Channel Reach
              </h3>
              <p className="text-green-100/60 leading-relaxed">
                Connect via Email, SMS, WhatsApp, and Phone with personalized communication strategies.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-12 mb-16"
        >
          <div className="text-center">
            <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
              98%
            </div>
            <div className="text-sm text-green-300/60 uppercase tracking-widest">Recovery Rate</div>
          </div>
          <div className="w-px bg-green-400/20" />
          <div className="text-center">
            <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-lime-400 mb-2">
              72H
            </div>
            <div className="text-sm text-green-300/60 uppercase tracking-widest">Avg Response</div>
          </div>
          <div className="w-px bg-green-400/20" />
          <div className="text-center">
            <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-400 mb-2">
              24/7
            </div>
            <div className="text-sm text-green-300/60 uppercase tracking-widest">Monitoring</div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 rounded-full blur-2xl opacity-60 group-hover:opacity-100"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative px-16 py-6 bg-black/80 backdrop-blur-xl border-2 border-green-400/60 rounded-full overflow-hidden group-hover:border-green-300 transition-colors">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              />
              <span className="relative text-3xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-lime-300">
                START RECOVERY NOW
              </span>
            </div>
          </motion.button>
          <p className="text-green-400/50 text-xs uppercase tracking-[0.3em] mt-5 font-medium">
            Join 1000+ Businesses Recovering Smarter
          </p>
        </motion.div>

      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
    </div>
  );
}