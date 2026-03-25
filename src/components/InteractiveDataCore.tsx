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
    const SPACING = 30; // Closer grid for higher resolution mesh
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
          const mass = 0.8 + Math.random() * 0.4;
          points.push({ x, y, bx: x, by: y, vx: 0, vy: 0, mass });
        }
      }
    }

    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, px: -1000, py: -1000, radius: 200, isDown: false };

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
        r.radius += 10 + r.radius * 0.05; // Expanding shockwave
        r.life -= 0.03;
        r.force *= 0.95;
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
          // Mouse velocity drag -> pulls grid along with fast cursor movements
          p.vx += mouse.vx * force * 0.08 / p.mass;
          p.vy += mouse.vy * force * 0.08 / p.mass;

          // Repulsion
          const pushStrength = mouse.isDown ? 12 : 3;
          p.vx -= (dx / distance) * force * pushStrength / p.mass;
          p.vy -= (dy / distance) * force * pushStrength / p.mass;
        }

        // 2. Shockwave Ripples
        for (const r of ripples) {
          const rdx = r.x - p.x;
          const rdy = r.y - p.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const distFromRing = Math.abs(rDist - r.radius);

          if (distFromRing < 40) {
            const rForce = r.force * (1 - distFromRing / 40);
            p.vx -= (rdx / rDist) * rForce / p.mass;
            p.vy -= (rdy / rDist) * rForce / p.mass;
          }
        }

        // 3. Spring constraints
        p.vx += (p.bx - p.x) * 0.04;
        p.vy += (p.by - p.y) * 0.04;

        // 4. Damping & Integration
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw structural mesh
      ctx.lineWidth = 0.5;
      
      // We loop over all cells, using path commands to minimize overhead
      ctx.beginPath();
      for (let i = 0; i < cols - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
          const p = points[i * rows + j];
          const right = points[(i + 1) * rows + j];
          const bottom = points[i * rows + (j + 1)];

          // Distances from base position (tension)
          const stretchRight = Math.abs(p.x - right.x) + Math.abs(p.y - right.y);
          const stretchBottom = Math.abs(p.x - bottom.x) + Math.abs(p.y - bottom.y);

          // We only draw lines if they aren't severely overstretched (prevent snapping looks)
          if (stretchRight < SPACING * 2.5) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(right.x, right.y);
          }
          if (stretchBottom < SPACING * 2.5) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(bottom.x, bottom.y);
          }
        }
      }
      ctx.strokeStyle = "rgba(135, 128, 116, 0.2)";
      ctx.stroke();

      // Dynamic Lighting / Glow on Nodes (Ambient Cursor Glow)
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        
        // Node tension determines color (blueish for relaxed, orange for stretched)
        const dx = p.x - p.bx;
        const dy = p.y - p.by;
        const displacement = Math.sqrt(dx * dx + dy * dy);

        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

        // Core points and tension points light up
        if (mDist < mouse.radius * 0.8 || displacement > 5) {
          const alphaCursor = Math.max(0, 1 - mDist / (mouse.radius * 0.8));
          const alphaStress = Math.min(1, displacement / 20);
          const finalAlpha = Math.max(alphaCursor * 0.7, alphaStress * 0.5);
          
          ctx.beginPath();
          // Mix colors: near cursor = orange (#FF5A1F), high stress = darker orange/red
          ctx.fillStyle = `rgba(255, 90, 31, ${finalAlpha})`; 
          ctx.arc(p.x, p.y, 1.5 + finalAlpha * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw active ripples
      for (const r of ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 90, 31, ${r.life * 0.3})`;
        ctx.lineWidth = 2 * r.life;
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
