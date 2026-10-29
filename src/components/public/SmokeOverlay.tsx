"use client";

import React, { useEffect, useRef } from "react";

// =========================================================================
// TWEAKABLE CONSTANTS (Dense & Rich Background Smoke Across Full Site)
// =========================================================================
export const SMOKE_CONFIG = {
  // Particle counts across the full viewport
  desktopParticleCount: 70,
  mobileParticleCount: 35,

  // Opacity & Warm Golden Color (denser as requested)
  baseOpacity: 0.11, // Rich, velvety & clearly visible (dense golden-smoke)
  colorRgb: "255, 224, 176", // Warm grey-gold tone
  secondaryColorRgb: "255, 195, 120", // Warm amber glow tone

  // Movement & Gentle Rising Float
  minRiseSpeed: 0.4, // Slow graceful upward drift
  maxRiseSpeed: 0.9,
  driftAmplitude: 0.4, // Lateral gentle waft
  expansionRate: 0.32, // Expands gracefully across the background

  // Dimensions for full-screen atmospheric puffs
  initialRadiusMin: 45,
  initialRadiusMax: 90,
  maxRadius: 210,

  // Spawn Area: throughout viewport and bottom
  spawnBottomFraction: 0.5,

  // Ambient Warm Diya Glow Pulse at bottom edge
  enableDiyaGlowPulse: true,
  glowBaseOpacity: 0.08,
  glowPulseRange: 0.04,
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  growth: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  phase: number;
  useSecondaryColor: boolean;
}

export function SmokeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId: number | null = null;
    let isVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Determine particle count based on screen width
    const isMobile = window.innerWidth < 768;
    const targetParticleCount = isMobile
      ? SMOKE_CONFIG.mobileParticleCount
      : SMOKE_CONFIG.desktopParticleCount;

    const particles: Particle[] = [];

    const createParticle = (spawnAnywhere = false): Particle => {
      // Span across entire viewport width with slight margin
      const startX = width * (0.01 + Math.random() * 0.98);

      // On initial start, distribute across full screen height; on respawn, spawn in bottom third
      const startY = spawnAnywhere
        ? height * Math.random()
        : height + Math.random() * 20;

      const maxLife = 260 + Math.random() * 220;
      const initialRadius =
        SMOKE_CONFIG.initialRadiusMin +
        Math.random() * (SMOKE_CONFIG.initialRadiusMax - SMOKE_CONFIG.initialRadiusMin);

      const speed =
        SMOKE_CONFIG.minRiseSpeed +
        Math.random() * (SMOKE_CONFIG.maxRiseSpeed - SMOKE_CONFIG.minRiseSpeed);

      return {
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * SMOKE_CONFIG.driftAmplitude,
        vy: -speed,
        radius: initialRadius,
        growth: SMOKE_CONFIG.expansionRate * (0.8 + Math.random() * 0.4),
        alpha: 0,
        maxAlpha: SMOKE_CONFIG.baseOpacity * (0.75 + Math.random() * 0.6),
        life: spawnAnywhere ? Math.random() * maxLife * 0.8 : 0,
        maxLife,
        phase: Math.random() * Math.PI * 2,
        useSecondaryColor: Math.random() > 0.6,
      };
    };

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < targetParticleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === 0 || h === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = w;
      height = h;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    if (prefersReducedMotion) {
      const renderStaticHaze = () => {
        ctx.clearRect(0, 0, width, height);
        const hazeGradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
        hazeGradient.addColorStop(0, `rgba(${SMOKE_CONFIG.colorRgb}, 0.08)`);
        hazeGradient.addColorStop(1, `rgba(${SMOKE_CONFIG.colorRgb}, 0)`);
        ctx.fillStyle = hazeGradient;
        ctx.fillRect(0, 0, width, height);
      };
      renderStaticHaze();
      return () => window.removeEventListener("resize", handleResize);
    }

    let time = 0;

    const render = () => {
      if (!isVisible) {
        animId = null;
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle warm ambient diya flicker at the bottom edge of viewport
      if (SMOKE_CONFIG.enableDiyaGlowPulse) {
        const glowAlpha =
          SMOKE_CONFIG.glowBaseOpacity +
          Math.sin(time * 2.1) * (SMOKE_CONFIG.glowPulseRange * 0.5) +
          Math.sin(time * 3.4) * (SMOKE_CONFIG.glowPulseRange * 0.5);

        const glowGrad = ctx.createRadialGradient(
          width * 0.5,
          height,
          30,
          width * 0.5,
          height,
          width * 0.65,
        );
        glowGrad.addColorStop(0, `rgba(255, 180, 80, ${Math.max(0, glowAlpha)})`);
        glowGrad.addColorStop(0.5, `rgba(255, 140, 40, ${Math.max(0, glowAlpha * 0.4)})`);
        glowGrad.addColorStop(1, "rgba(255, 120, 20, 0)");

        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
      }

      // 2. Render atmospheric smoke puffs
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        const progress = p.life / p.maxLife;

        // Smooth sine fade-in & fade-out curve
        p.alpha = Math.sin(progress * Math.PI) * p.maxAlpha;

        // Upward float with gentle lateral drift
        p.x += p.vx + Math.sin(p.phase + time * 1.2) * 0.3;
        p.y += p.vy;

        if (p.radius < SMOKE_CONFIG.maxRadius) {
          p.radius += p.growth;
        }

        if (p.alpha > 0.001) {
          const color = p.useSecondaryColor
            ? SMOKE_CONFIG.secondaryColorRgb
            : SMOKE_CONFIG.colorRgb;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(${color}, ${p.alpha})`);
          grad.addColorStop(0.35, `rgba(${color}, ${p.alpha * 0.65})`);
          grad.addColorStop(0.7, `rgba(${color}, ${p.alpha * 0.25})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Respawn when particle completes its lifespan or ascends past top of viewport
        if (p.life >= p.maxLife || p.y < -SMOKE_CONFIG.maxRadius) {
          particles[i] = createParticle(false);
        }
      }

      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!animId && isVisible) {
        animId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startAnimation();

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[1]"
      style={{
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
