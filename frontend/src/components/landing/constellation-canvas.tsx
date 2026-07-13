"use client";

/**
 * PactFlow — ConstellationCanvas Component
 * High-performance 60fps HTML5 Canvas background drawing drifting stars and glowing trust threads.
 * Automatically respects prefers-reduced-motion.
 */
import React, { useEffect, useRef } from "react";

interface ConstellationCanvasProps {
  className?: string;
  starCount?: number;
  connectionDistance?: number;
  interactive?: boolean;
  accentColor?: string; // e.g. "#F2B84B" (Primary Golden) or "#9FD8FF" (Network Cyan)
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  color: string;
}

export function ConstellationCanvas({
  className = "",
  starCount = 65,
  connectionDistance = 140,
  interactive = true,
  accentColor = "#F2B84B",
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse position tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);
    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    // Initialize stars
    const colors = ["#F5F3ED", "#9FD8FF", accentColor, "#ffffff"];
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.4,
      vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      targetAlpha: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!prefersReducedMotion) {
          star.x += star.vx;
          star.y += star.vy;

          // Bounce off edges
          if (star.x < 0 || star.x > width) star.vx = -star.vx;
          if (star.y < 0 || star.y > height) star.vy = -star.vy;

          // Gentle twinkling
          if (Math.random() < 0.02) {
            star.targetAlpha = Math.random() * 0.8 + 0.2;
          }
          star.alpha += (star.targetAlpha - star.alpha) * 0.05;
        }

        // Draw star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = star.radius > 1.5 ? 8 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connecting lines between nearby stars
        for (let j = i + 1; j < stars.length; j++) {
          const starB = stars[j];
          const dx = star.x - starB.x;
          const dy = star.y - starB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * 0.25 * star.alpha;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(starB.x, starB.y);
            ctx.strokeStyle = star.color === accentColor || starB.color === accentColor ? accentColor : "#9FD8FF";
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect star to mouse if near
        if (interactive && mouse.x > 0 && mouse.y > 0) {
          const mdx = star.x - mouse.x;
          const mdy = star.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            const mAlpha = (1 - mdist / mouse.radius) * 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = accentColor;
            ctx.globalAlpha = mAlpha;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [starCount, connectionDistance, interactive, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
