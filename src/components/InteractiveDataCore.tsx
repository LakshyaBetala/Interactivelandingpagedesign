"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveDataCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Coarse pointers (phones/tablets) never hover, so the mesh has to animate itself.
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Density and spring configuration. Sparser on phones so the hero never
    // competes with the scroll for main-thread time.
    const SPACING = width < 640 ? 34 : 25;
    let cols = Math.floor(width / SPACING) + 2;
    let rows = Math.floor(height / SPACING) + 2;

    interface GridPoint {
      x: number;
      y: number;
      bx: number;
      by: number;
      vx: number;
      vy: number;
      mass: number;
    }

    interface Ripple {
      x: number;
      y: number;
      radius: number;
      force: number;
      life: number;
    }

    let points: GridPoint[] = [];
    const ripples: Ripple[] = [];
    let frame = 0;
    let rafId = 0;

    function init() {
      points = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * SPACING;
          const y = j * SPACING;
          // Random slight mass variance for organic fluid feel
          const mass = 0.5 + Math.random() * 0.5;
          points.push({ x, y, bx: x, by: y, vx: 0, vy: 0, mass });
        }
      }
    }

    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, px: -1000, py: -1000, radius: 240, isDown: false };

    // Ambient mode: when nobody is touching or hovering, a virtual cursor drifts
    // across the mesh so the nodes keep breathing on their own.
    let lastInteraction = coarsePointer ? -Infinity : 0;
    const AMBIENT_DELAY = 1400;
    const t0 = performance.now();

    function ambientPosition(now: number) {
      const t = (now - t0) / 1000;
      return {
        x: width * (0.5 + 0.32 * Math.sin(t * 0.21) * Math.cos(t * 0.07)),
        y: height * (0.5 + 0.28 * Math.sin(t * 0.16 + 1.2)),
      };
    }

    function animate(now: number) {
      if (!ctx || !canvas) return;
      rafId = requestAnimationFrame(animate);

      // On phones, run the physics at ~30fps. Halving the work here is what keeps
      // scrolling smooth while the mesh is on screen.
      frame++;
      if (coarsePointer && frame % 2 === 0) return;

      // Drive the virtual cursor when the real one has gone quiet.
      if (now - lastInteraction > AMBIENT_DELAY) {
        const a = ambientPosition(now);
        mouse.x = a.x;
        mouse.y = a.y;
        if (mouse.px === -1000) {
          mouse.px = mouse.x;
          mouse.py = mouse.y;
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Compute cursor velocity
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      // Update ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 12 + r.radius * 0.06; // Faster shockwave
        r.life -= 0.025;
        r.force *= 0.94;
        if (r.life <= 0) ripples.splice(i, 1);
      }

      // Physics integration
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // 1. Mouse Interaction (Magnetic push/pull based on velocity)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const distForce = Math.pow(force, 2); // Squared falloff for sharper feel

          // Mouse velocity drag -> pulls grid along
          p.vx += mouse.vx * distForce * 0.12 / p.mass;
          p.vy += mouse.vy * distForce * 0.12 / p.mass;

          // Repulsion/Interaction
          const pushStrength = mouse.isDown ? 18 : 4;
          p.vx -= (dx / distance) * distForce * pushStrength / p.mass;
          p.vy -= (dy / distance) * distForce * pushStrength / p.mass;
        }

        // 2. Shockwave Ripples
        for (const r of ripples) {
          const rdx = r.x - p.x;
          const rdy = r.y - p.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const distFromRing = Math.abs(rDist - r.radius);

          if (distFromRing < 60) {
            const rForce = r.force * (1 - distFromRing / 60) * r.life;
            p.vx -= (rdx / rDist) * rForce / p.mass;
            p.vy -= (rdy / rDist) * rForce / p.mass;
          }
        }

        // 3. Spring constraints (Finer tension)
        p.vx += (p.bx - p.x) * 0.035;
        p.vy += (p.by - p.y) * 0.035;

        // 4. Damping & Integration
        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw structural mesh
      ctx.lineWidth = 0.6;

      ctx.beginPath();
      for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
          const p = points[i * rows + j];
          const right = points[(i + 1) * rows + j];
          const bottom = points[i * rows + (j + 1)];

          const stretchRight = Math.sqrt(Math.pow(p.x - right.x, 2) + Math.pow(p.y - right.y, 2));
          const stretchBottom = Math.sqrt(Math.pow(p.x - bottom.x, 2) + Math.pow(p.y - bottom.y, 2));

          if (stretchRight < SPACING * 3) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(right.x, right.y);
          }
          if (stretchBottom < SPACING * 3) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(bottom.x, bottom.y);
          }
        }
      }
      ctx.strokeStyle = "rgba(135, 128, 116, 0.15)";
      ctx.stroke();

      // Dynamic Node Lighting
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const dx = p.x - p.bx;
        const dy = p.y - p.by;
        const displacement = Math.sqrt(dx * dx + dy * dy);

        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mDist < mouse.radius || displacement > 4) {
          const alphaCursor = Math.max(0, 1 - mDist / mouse.radius);
          const alphaStress = Math.min(1, displacement / 25);
          const finalAlpha = Math.max(alphaCursor * 0.8, alphaStress * 0.7);

          if (finalAlpha > 0.05) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 90, 31, ${finalAlpha})`;
            ctx.arc(p.x, p.y, 1.2 + finalAlpha * 2, 0, Math.PI * 2);
            ctx.fill();

            // Add a subtle bloom for high tension points
            if (finalAlpha > 0.6) {
              ctx.shadowBlur = 10 * finalAlpha;
              ctx.shadowColor = "#FF5A1F";
              ctx.stroke();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw active ripples (Subtle glow rings)
      for (const r of ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 90, 31, ${r.life * 0.25})`;
        ctx.lineWidth = 1.5 * r.life;
        ctx.stroke();
      }
    }

    init();

    if (!reduceMotion) {
      rafId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      // Mobile browsers fire resize every time the URL bar collapses during a
      // scroll. Rebuilding the grid on those events is what made scrolling stutter,
      // so only react when the width actually changes.
      if (window.innerWidth === width) {
        height = window.innerHeight;
        canvas.height = height;
        return;
      }
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.floor(width / SPACING) + 2;
      rows = Math.floor(height / SPACING) + 2;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      lastInteraction = performance.now();
      if (mouse.px === -1000) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
    };
    const handleMouseLeave = () => {
      mouse.isDown = false;
      // Hand control back to the ambient drift rather than snapping the mesh flat.
      lastInteraction = 0;
    };

    // Add Shockwave ripple on click
    const handleMouseDown = () => {
      mouse.isDown = true;
      lastInteraction = performance.now();
      ripples.push({ x: mouse.x, y: mouse.y, radius: 10, force: 30, life: 1 });
    };
    const handleMouseUp = () => (mouse.isDown = false);

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      lastInteraction = performance.now();
      ripples.push({ x: mouse.x, y: mouse.y, radius: 10, force: 30, life: 1 });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
      lastInteraction = performance.now();
    };

    const handleTouchEnd = () => {
      mouse.isDown = false;
      lastInteraction = 0;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    // Passive: the canvas must never swallow a scroll gesture.
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 cursor-crosshair pointer-events-auto"
      // pan-y lets the browser own vertical scrolling while the mesh still reads
      // horizontal drags. `none` here was blocking scroll on mobile entirely.
      style={{ touchAction: "pan-y" }}
    />
  );
}
