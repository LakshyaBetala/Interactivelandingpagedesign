import React from "react";

export default function NoiseGradientBridge({ from, to }: { from: "light" | "dark"; to: "light" | "dark" }) {
  if (from === to) return null;
  
  const isLightToDark = from === "light";
  
  return (
    <div className="w-full h-32 lg:h-56 relative overflow-hidden pointer-events-none">
        {/* Soft, multi-stop easing gradient for a silky transition (Non-linear) */}
        <div 
          className="absolute inset-0 z-0" 
          style={{
             background: isLightToDark 
                ? "linear-gradient(to bottom, #E6DFD5 0%, #C4B8A8 20%, #878074 45%, #3A3632 70%, #1A1A1A 85%, #0D0D0D 100%)"
                : "linear-gradient(to top, #E6DFD5 0%, #C4B8A8 20%, #878074 45%, #3A3632 70%, #1A1A1A 85%, #0D0D0D 100%)"
          }} 
        />

        {/* SVG Noise overlay for cinematic film grain mixed into the gradient */}
        <div 
          className="absolute inset-0 z-10 opacity-[0.2] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Sharp top edge line to contrast the soft gradient */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#878074]/30 z-20" />
        <div className="absolute top-[1px] left-0 w-full h-[1px] bg-[#E6DFD5]/20 z-20" />
    </div>
  );
}
