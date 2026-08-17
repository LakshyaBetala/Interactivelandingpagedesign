"use client";

import React from "react";
import { MotionConfig } from "framer-motion";

/**
 * `reducedMotion="user"` makes every Framer Motion component on the site honour
 * prefers-reduced-motion automatically — transforms and opacity snap to their
 * final value instead of animating. Without this the CSS media query in
 * globals.css has no effect on JS-driven animation.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
