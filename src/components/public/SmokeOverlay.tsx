"use client";

import React, { useEffect, useRef } from "react";

// =========================================================================
// TWEAKABLE CONSTANTS (Tune Smoke & Diya Ember Intensity)
// =========================================================================
export const SMOKE_CONFIG = {
  // Particle counts
  desktopParticleCount: 60,
  mobileParticleCount: 28,

  // Opacity & Color: warm grey-gold / amber smoke (subtle & elegant)
  baseOpacity: 0.065, // Peak opacity per puff (0.04 to 0.10 recommended)
  colorRgb: "255, 222, 172", // Warm grey-gold tone
  secondaryColorRgb: "245, 205, 150", // Soft ambient warmth

  // Movement & Expansion
  minRiseSpeed: 0.3, // Upward drift speed min
  maxRiseSpeed: 0.7, // Upward drift speed max
  driftAmplitude: 0.25, // Lateral gentle waft
  expansionRate: 0.16, // How fast smoke expands as it rises

  // Dimensions
  initialRadiusMin: 14,
  initialRadiusMax: 26,
  maxRadius: 85,

  // Spawn Area: bottom third where diyas are placed in hero image
  spawnBottomFraction: 0.32, // Bottom 32% of hero artwork

  // Ambient Diya Warm Glow Pulse (bottom edge)
  enableDiyaGlowPulse: true,
  glowBaseOpacity: 0.07,
  glowPulseRange: 0.03, // Gently breathes +/- 0.03
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
    let isIntersecting = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Determine particle count based on screen width
    const isMobile = window.innerWidth < 768;
    const targetParticleCount = isMobile
      ? SMOKE_CONFIG.mobileParticleCount
      : SMOKE_CONFIG.desktopParticleCount;

    // Initialize particle pool
    const particles: Particle[] = [];

    const createParticle = (spawnAnywhereInLowerThird = false): Particle => {
      const spawnHeight = height * SMOKE_CONFIG.spawnBottomFraction;
      const startY = spawnAnywhereInLowerThird
        ? height - Math.random() * (spawnHeight * 1.5)
        : height - Math.random() * spawnHeight;

      // Span across the image where diyas are located (avoiding extreme edges)
      const startX = width * (0.05 + Math.random() * 0.9);

      const maxLife = 180 + Math.random() * 160;
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
        maxAlpha: SMOKE_CONFIG.baseOpacity * (0.7 + Math.random() * 0.6),
        life: spawnAnywhereInLowerThird ? Math.random() * maxLife : 0,
        maxLife,
        phase: Math.random() * Math.PI * 2,
        useSecondaryColor: Math.random() > 0.6,
      };
    };

    // Pre-populate particles across their lifetime
    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < targetParticleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    // Handle high-DPI sizing
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();

    // ResizeObserver for responsive fluid scaling
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(canvas);

    // If reduced motion is requested, render a single static soft haze at the diya level
    if (prefersReducedMotion) {
      const renderStaticHaze = () => {
        ctx.clearRect(0, 0, width, height);
        const hazeGradient = ctx.createLinearGradient(0, height, 0, height * 0.65);
        hazeGradient.addColorStop(0, `rgba(${SMOKE_CONFIG.colorRgb}, 0.08)`);
        hazeGradient.addColorStop(1, `rgba(${SMOKE_CONFIG.colorRgb}, 0)`);
        ctx.fillStyle = hazeGradient;
        ctx.fillRect(0, height * 0.65, width, height * 0.35);
      };
      renderStaticHaze();
      return () => resizeObserver.disconnect();
    }

    let time = 0;

    // Animation Loop
    const render = () => {
      if (!isVisible || !isIntersecting) {
        animId = null;
        return;
      }

      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle warm ambient diya flicker at the bottom
      if (SMOKE_CONFIG.enableDiyaGlowPulse) {
        const glowAlpha =
          SMOKE_CONFIG.glowBaseOpacity +
          Math.sin(time * 2.2) * (SMOKE_CONFIG.glowPulseRange * 0.5) +
          Math.sin(time * 3.7) * (SMOKE_CONFIG.glowPulseRange * 0.5);

        const glowGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.92,
          10,
          width * 0.5,
          height * 0.92,
          width * 0.45,
        );
        glowGrad.addColorStop(0, `rgba(255, 175, 75, ${Math.max(0, glowAlpha)})`);
        glowGrad.addColorStop(0.5, `rgba(255, 140, 40, ${Math.max(0, glowAlpha * 0.4)})`);
        glowGrad.addColorStop(1, "rgba(255, 120, 20, 0)");

        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
      }

      // 2. Render and update smoke particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Life cycle progression: 0 to 1
        const progress = p.life / p.maxLife;

        // Soft smooth fade-in then fade-out curve (sine-based)
        p.alpha = Math.sin(progress * Math.PI) * p.maxAlpha;

        // Drifts upward and gently waves sideways
        p.x += p.vx + Math.sin(p.phase + time * 1.2) * 0.2;
        p.y += p.vy;

        // Radius expands gracefully as puff ascends
        if (p.radius < SMOKE_CONFIG.maxRadius) {
          p.radius += p.growth;
        }

        // Draw soft radial puff
        if (p.alpha > 0.001) {
          const color = p.useSecondaryColor
            ? SMOKE_CONFIG.secondaryColorRgb
            : SMOKE_CONFIG.colorRgb;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(${color}, ${p.alpha})`);
          grad.addColorStop(0.45, `rgba(${color}, ${p.alpha * 0.65})`);
          grad.addColorStop(0.8, `rgba(${color}, ${p.alpha * 0.2})`);
          grad.addColorStop(1, `rgba(${color}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Respawn when particle completes its lifespan or drifts too high
        if (p.life >= p.maxLife || p.y < height * 0.2) {
          particles[i] = createParticle(false);
        }
      }

      animId = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (!animId && isVisible && isIntersecting) {
        animId = requestAnimationFrame(render);
      }
    };

    const stopAnimation = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    // Pause when tab is inactive / hidden
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Pause when hero is scrolled out of viewport
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = Boolean(entry && entry.isIntersecting);
        if (isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(canvas);

    // Initial kickoff
    startAnimation();

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
