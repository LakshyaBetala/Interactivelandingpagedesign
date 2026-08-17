"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  // Motion values are written outside React state, so tracking the cursor no
  // longer re-renders the whole page on every mousemove.
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const opacity = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  useEffect(() => {
    // A 400px glow is pointless on touch, and unwelcome under reduced motion.
    // Skipping the listeners leaves opacity at 0, so the element stays invisible.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX - 200);
      y.set(e.clientY - 200);
      opacity.set(1);
    };
    const handleMouseLeave = () => opacity.set(0);
    const handleMouseEnter = () => opacity.set(1);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [x, y, opacity]);

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
      style={{ x: springX, y: springY, opacity }}
    >
      <div
        className="w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,90,31,0.06) 0%, rgba(255,90,31,0.02) 40%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}
