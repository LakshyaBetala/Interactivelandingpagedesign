"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveDataCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Density and spring configuration
    const SPACING = 25; // Even tighter grid for "high-def" mesh
    const cols = Math.floor(width / SPACING) + 2;
    const rows = Math.floor(height / SPACING) + 2;

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
    let ripples: Ripple[] = [];
    
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

    function animate() {
      if (!ctx || !canvas) return;
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

      requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      if (mouse.px === -1000) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
      }
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.px = -1000;
      mouse.py = -1000;
      mouse.isDown = false;
    };
    
    // Add Shockwave ripple on click
    const handleMouseDown = () => { 
      mouse.isDown = true; 
      ripples.push({ x: mouse.x, y: mouse.y, radius: 10, force: 30, life: 1 });
    };
    const handleMouseUp = () => (mouse.isDown = false);

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.isDown = true;
        ripples.push({ x: mouse.x, y: mouse.y, radius: 10, force: 30, life: 1 });
    });
    canvas.addEventListener("touchend", handleMouseUp);
    canvas.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = touch.clientX - rect.left;
        mouse.y = touch.clientY - rect.top;
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 cursor-crosshair pointer-events-auto"
      style={{ touchAction: "none" }}
    />
  );
}
