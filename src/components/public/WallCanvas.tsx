"use client";

import React, { useRef, useEffect, useCallback } from "react";

export interface WallDiya {
  id: string;
  publicId: string;
  seq: number;
  style: string;
  locale: string;
  wishText: string;
  dedication: string | null;
  createdAt: string;
}

interface WallCanvasProps {
  diyas: WallDiya[];
  focusedPublicId?: string | null;
  onSelectDiya: (diya: WallDiya) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Deterministic pseudo-random generator seeded by integer
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export const WallCanvas: React.FC<WallCanvasProps> = ({
  diyas,
  focusedPublicId,
  onSelectDiya,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport camera transform state
  const cameraRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastTouchDist: 0,
  });

  // Performance monitoring: degrade glow if frame time > 24ms
  const glowQualityRef = useRef<"high" | "low">("high");
  const frameTimesRef = useRef<number[]>([]);

  // Track global flame flicker phase
  const animTimeRef = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);

  // Spacing & grid configuration
  const SPACING_X = 72;
  const SPACING_Y = 64;
  const COLS = 30;

  // Calculate coordinates for a diya deterministically
  const getDiyaCoords = useCallback((seq: number) => {
    const col = (seq - 1) % COLS;
    const row = Math.floor((seq - 1) / COLS);

    // Stagger every second row by half a column
    const staggerX = (row % 2 === 1) ? SPACING_X / 2 : 0;
    const jitterX = (pseudoRandom(seq * 13) - 0.5) * 16;
    const jitterY = (pseudoRandom(seq * 29) - 0.5) * 14;

    const x = col * SPACING_X + staggerX + jitterX + 40;
    const y = row * SPACING_Y + jitterY + 60;

    return { x, y };
  }, []);

  // Center camera on focused diya if provided
  useEffect(() => {
    if (focusedPublicId && diyas.length > 0) {
      const target = diyas.find((d) => d.publicId === focusedPublicId);
      if (target && canvasRef.current) {
        const { x, y } = getDiyaCoords(target.seq);
        const rect = canvasRef.current.getBoundingClientRect();
        cameraRef.current.x = rect.width / 2 - x * cameraRef.current.scale;
        cameraRef.current.y = rect.height / 2 - y * cameraRef.current.scale;
      }
    }
  }, [focusedPublicId, diyas, getDiyaCoords]);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      if (!isRunning) return;

      const dt = now - lastTimestamp;
      lastTimestamp = now;

      // Track frame times for rolling window
      frameTimesRef.current.push(dt);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        glowQualityRef.current = avgFrameTime > 24 ? "low" : "high";
      }

      animTimeRef.current = now * 0.003;
      const flickerAlpha = 0.82 + Math.sin(animTimeRef.current * 4) * 0.08 + Math.cos(animTimeRef.current * 7) * 0.06;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Midnight night background
      ctx.fillStyle = "#0B1030";
      ctx.fillRect(0, 0, width, height);

      // Camera transform
      ctx.translate(cameraRef.current.x, cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);

      const isHighQuality = glowQualityRef.current === "high";

      // Viewport culling boundaries
      const invScale = 1 / cameraRef.current.scale;
      const viewLeft = -cameraRef.current.x * invScale - 60;
      const viewTop = -cameraRef.current.y * invScale - 60;
      const viewRight = (-cameraRef.current.x + width) * invScale + 60;
      const viewBottom = (-cameraRef.current.y + height) * invScale + 60;

      // Draw each visible diya
      for (let i = 0; i < diyas.length; i++) {
        const diya = diyas[i];
        const { x, y } = getDiyaCoords(diya.seq);

        // Cull offscreen diyas
        if (x < viewLeft || x > viewRight || y < viewTop || y > viewBottom) {
          continue;
        }

        const isFocused = focusedPublicId === diya.publicId;

        // Draw soft ambient flame glow
        if (isHighQuality) {
          const glowRadius = isFocused ? 32 : 18;
          const glowGrad = ctx.createRadialGradient(x, y - 8, 2, x, y - 8, glowRadius);
          glowGrad.addColorStop(0, `rgba(255, 200, 87, ${flickerAlpha * 0.5})`);
          glowGrad.addColorStop(0.5, `rgba(255, 159, 28, ${flickerAlpha * 0.2})`);
          glowGrad.addColorStop(1, "rgba(255, 159, 28, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(x, y - 8, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Diya Base depending on style
        ctx.save();
        ctx.translate(x, y);

        // Diya Base Color & Shape
        let baseColor = "#C05621"; // default clay
        if (diya.style === "golden") baseColor = "#D69E2E";
        else if (diya.style === "marigold") baseColor = "#DD6B20";
        else if (diya.style === "rangoli") baseColor = "#B83280";
        else if (diya.style === "lotus") baseColor = "#D53F8C";

        // Draw Diya Bowl
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI);
        ctx.fill();

        // Rim
        ctx.strokeStyle = "#FFD98A";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Diya Flame
        const flameHeight = 12 + Math.sin(animTimeRef.current * 8 + diya.seq) * 1.5;
        ctx.fillStyle = "#FFC857";
        ctx.beginPath();
        ctx.moveTo(-3, -2);
        ctx.quadraticCurveTo(-4, -flameHeight * 0.6, 0, -flameHeight);
        ctx.quadraticCurveTo(4, -flameHeight * 0.6, 3, -2);
        ctx.closePath();
        ctx.fill();

        // Inner flame core
        ctx.fillStyle = "#FFF8EB";
        ctx.beginPath();
        ctx.ellipse(0, -flameHeight * 0.4, 1.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Focus halo ring if focused
        if (isFocused) {
          ctx.strokeStyle = "#FFC857";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(0, -6, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [diyas, focusedPublicId, getDiyaCoords]);

  // Handle pointer interactions (drag to pan, click to hit-test)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.startX = e.clientX - cameraRef.current.x;
    cameraRef.current.startY = e.clientY - cameraRef.current.y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    cameraRef.current.x = e.clientX - cameraRef.current.startX;
    cameraRef.current.y = e.clientY - cameraRef.current.startY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    cameraRef.current.isDragging = false;

    // Check if this was a click rather than a substantial drag
    const distMoved = Math.hypot(
      e.clientX - (cameraRef.current.startX + cameraRef.current.x),
      e.clientY - (cameraRef.current.startY + cameraRef.current.y)
    );

    if (distMoved < 8) {
      handleHitTest(e.clientX, e.clientY);
    }
  };

  // 24px radius hit-testing
  const handleHitTest = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Transform mouse into world coordinates
    const worldX = (mouseX - cameraRef.current.x) / cameraRef.current.scale;
    const worldY = (mouseY - cameraRef.current.y) / cameraRef.current.scale;

    let closestDiya: WallDiya | null = null;
    let closestDist = 24; // 24px threshold

    for (let i = 0; i < diyas.length; i++) {
      const d = diyas[i];
      const { x, y } = getDiyaCoords(d.seq);
      const dist = Math.hypot(worldX - x, worldY - y);
      if (dist < closestDist) {
        closestDist = dist;
        closestDiya = d;
      }
    }

    if (closestDiya) {
      onSelectDiya(closestDiya);
    }
  };

  // Zoom controls
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(cameraRef.current.scale * zoomFactor, 0.4), 2.5);
    cameraRef.current.scale = newScale;
  };

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] overflow-hidden rounded-2xl border border-flame-400/20 bg-night-950 shadow-inner select-none cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block"
        aria-label="Interactive Diya Wall Canvas"
      />

      {/* Floating Instructions & Zoom Controls */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] text-ivory-300/70 bg-night-900/80 px-3 py-1.5 rounded-lg border border-night-800 backdrop-blur-sm">
        Drag to explore • Tap any flame to view wish
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            cameraRef.current.scale = Math.min(cameraRef.current.scale * 1.25, 2.5);
          }}
          className="w-9 h-9 rounded-lg bg-night-900/90 border border-night-750 text-ivory-100 flex items-center justify-center text-base hover:bg-night-800 active:scale-95 transition-all shadow"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            cameraRef.current.scale = Math.max(cameraRef.current.scale * 0.8, 0.4);
          }}
          className="w-9 h-9 rounded-lg bg-night-900/90 border border-night-750 text-ivory-100 flex items-center justify-center text-base hover:bg-night-800 active:scale-95 transition-all shadow"
          title="Zoom out"
        >
          −
        </button>
      </div>
    </div>
  );
};
