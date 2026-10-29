"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { geoMercator, geoPath, geoContains } from "d3-geo";
import type { ExtendedFeatureCollection } from "d3-geo";
import { findStateInfo, hashToSeed, seededRandom, INDIA_POPULATION_HUBS } from "@/lib/geo/indiaStates";

export interface WallDiya {
  id: string;
  publicId: string;
  seq: number;
  style: string;
  locale: string;
  wishText: string;
  dedication: string | null;
  state?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
}

interface WallCanvasProps {
  diyas: WallDiya[];
  focusedPublicId?: string | null;
  onSelectDiya: (diya: WallDiya) => void;
  activeLanguage?: string;
  activeCategory?: string;
}

interface ProjectedDiya {
  diya: WallDiya;
  lng: number;
  lat: number;
  x: number;
  y: number;
  seed: number;
  stateName: string;
}

// Color palettes for different traditional Diya styles
const DIYA_PALETTES: Record<
  string,
  {
    bowlTop: string;
    bowlBottom: string;
    rim: string;
    flameOuter: string;
    flameInner: string;
  }
> = {
  clay: {
    bowlTop: "#B45309", // rich earthen terracotta
    bowlBottom: "#78350F",
    rim: "#FDE68A",
    flameOuter: "#FF8C00",
    flameInner: "#FFE57F",
  },
  golden: {
    bowlTop: "#F59E0B", // shining brass
    bowlBottom: "#92400E",
    rim: "#FEF08A",
    flameOuter: "#FF9F1C",
    flameInner: "#FFFBEB",
  },
  marigold: {
    bowlTop: "#D97706",
    bowlBottom: "#854D0E",
    rim: "#FEF08A",
    flameOuter: "#F97316",
    flameInner: "#FEF08A",
  },
  rangoli: {
    bowlTop: "#BE185D", // festive magenta
    bowlBottom: "#831843",
    rim: "#FBCFE8",
    flameOuter: "#FF8C00",
    flameInner: "#FFE4E6",
  },
  lotus: {
    bowlTop: "#9D174D",
    bowlBottom: "#701A75",
    rim: "#F472B6",
    flameOuter: "#FB923C",
    flameInner: "#FFF1F2",
  },
};

/**
 * Renders an authentic miniature Diya in native screen coordinates.
 * Pure vector drawing: 100% crisp at any zoom level, never pixelates or blurs.
 */
function drawCrispDiya(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  styleName: string,
  alpha: number,
  isFocused: boolean,
  isHovered: boolean,
  animTime: number
) {
  const palette = DIYA_PALETTES[styleName] || DIYA_PALETTES.clay;
  const isHighlighted = isFocused || isHovered;
  const effectiveSize = isHighlighted ? size * 1.35 : size;

  ctx.save();
  ctx.globalAlpha = alpha;

  // 1. Soft warm ambient aura (gentle, festive, NOT blinding)
  const auraRadius = effectiveSize * 1.15;
  const auraGrad = ctx.createRadialGradient(
    cx,
    cy - effectiveSize * 0.25,
    1,
    cx,
    cy - effectiveSize * 0.25,
    auraRadius
  );
  auraGrad.addColorStop(0, isHighlighted ? "rgba(255, 180, 50, 0.32)" : "rgba(255, 150, 30, 0.2)");
  auraGrad.addColorStop(0.5, "rgba(255, 100, 10, 0.07)");
  auraGrad.addColorStop(1, "rgba(255, 60, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - effectiveSize * 0.25, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Terracotta / Metallic Earthen Diya Bowl
  const bw = effectiveSize * 0.44; // half-width
  const bh = effectiveSize * 0.42; // bowl depth

  const bowlGrad = ctx.createLinearGradient(cx, cy, cx, cy + bh);
  bowlGrad.addColorStop(0, palette.bowlTop);
  bowlGrad.addColorStop(1, palette.bowlBottom);

  ctx.beginPath();
  ctx.moveTo(cx - bw, cy);
  ctx.quadraticCurveTo(cx, cy + bh, cx + bw, cy);
  ctx.closePath();
  ctx.fillStyle = bowlGrad;
  ctx.fill();

  // 3. Golden Rim of the Diya
  ctx.beginPath();
  ctx.ellipse(cx, cy, bw, bw * 0.26, 0, 0, Math.PI * 2);
  ctx.fillStyle = palette.bowlTop;
  ctx.fill();
  ctx.strokeStyle = palette.rim;
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // Tiny wick tip
  ctx.fillStyle = "#3E1E08";
  ctx.fillRect(cx - 0.7, cy - 2, 1.4, 2.2);

  // 4. Teardrop Sacred Flame (Dancing Flame)
  const flameDance = Math.sin(animTime * 6.5 + cx * 0.1) * (effectiveSize * 0.06);
  const flameHeight = effectiveSize * 0.62 + flameDance;
  const flameWidth = effectiveSize * 0.24;

  const flameGrad = ctx.createLinearGradient(cx, cy, cx, cy - flameHeight);
  flameGrad.addColorStop(0, palette.flameOuter);
  flameGrad.addColorStop(0.65, palette.flameInner);
  flameGrad.addColorStop(1, "#FFFFFF");

  ctx.beginPath();
  ctx.moveTo(cx - flameWidth, cy - 0.5);
  ctx.bezierCurveTo(
    cx - flameWidth * 1.3,
    cy - flameHeight * 0.45,
    cx - flameWidth * 0.3,
    cy - flameHeight * 0.82,
    cx,
    cy - flameHeight
  );
  ctx.bezierCurveTo(
    cx + flameWidth * 0.3,
    cy - flameHeight * 0.82,
    cx + flameWidth * 1.3,
    cy - flameHeight * 0.45,
    cx + flameWidth,
    cy - 0.5
  );
  ctx.closePath();
  ctx.fillStyle = flameGrad;
  ctx.fill();

  // 5. Delicate inner flame core
  ctx.beginPath();
  const innerH = flameHeight * 0.68;
  const innerW = flameWidth * 0.45;
  ctx.moveTo(cx - innerW, cy - 0.5);
  ctx.bezierCurveTo(
    cx - innerW * 1.1,
    cy - innerH * 0.5,
    cx - innerW * 0.2,
    cy - innerH * 0.85,
    cx,
    cy - innerH
  );
  ctx.bezierCurveTo(
    cx + innerW * 0.2,
    cy - innerH * 0.85,
    cx + innerW * 1.1,
    cy - innerH * 0.5,
    cx + innerW,
    cy - 0.5
  );
  ctx.closePath();
  ctx.fillStyle = "#FFFCE8";
  ctx.fill();

  // 6. Highlight ring if focused
  if (isHighlighted) {
    const ringPulse = effectiveSize * 0.85 + Math.sin(animTime * 4.5) * 3;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 2.5]);
    ctx.beginPath();
    ctx.arc(cx, cy - flameHeight * 0.35, ringPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

export const WallCanvas: React.FC<WallCanvasProps> = ({
  diyas,
  focusedPublicId,
  onSelectDiya,
  activeLanguage = "all",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // GeoJSON data state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [geoData, setGeoData] = useState<ExtendedFeatureCollection<any> | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Tooltip interaction state
  const [hoveredDiya, setHoveredDiya] = useState<{
    diya: WallDiya;
    stateName: string;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Viewport camera transform state (defaults to scale=1, perfectly fitting India)
  const cameraRef = useRef({
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
  });

  const animFrameId = useRef<number | null>(null);
  const animTimeRef = useRef<number>(0);

  // 1. Fetch India GeoJSON once
  useEffect(() => {
    let isMounted = true;
    const fetchGeoJSON = async () => {
      try {
        setGeoLoading(true);
        const res = await fetch("/india.geojson");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setGeoData(data);
          }
        }
      } catch (err) {
        console.error("Failed to load India GeoJSON:", err);
      } finally {
        if (isMounted) setGeoLoading(false);
      }
    };

    fetchGeoJSON();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Responsive dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 700,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // 3. D3 Projection fitting India map to canvas size
  const { projection, pathGenerator } = useMemo(() => {
    if (!geoData) {
      return { projection: null, pathGenerator: null };
    }

    const { width, height } = dimensions;
    // Generous padding so entire Kashmir to Kanyakumari and Gujarat to Arunachal are comfortably in view
    const paddingX = Math.max(28, width * 0.06);
    const paddingY = Math.max(24, height * 0.05);

    const proj = geoMercator().fitExtent(
      [
        [paddingX, paddingY],
        [width - paddingX, height - paddingY],
      ],
      geoData
    );

    const path = geoPath().projection(proj);
    return { projection: proj, pathGenerator: path };
  }, [geoData, dimensions]);

  // 4. Calculate and cache projected positions for each diya
  const projectedDiyas: ProjectedDiya[] = useMemo(() => {
    if (!projection || !geoData) return [];

    return diyas.map((diya) => {
      const seed = hashToSeed(diya.publicId || diya.id || diya.seq);

      let lng: number;
      let lat: number;
      let stateName = diya.state || "India";

      if (typeof diya.lng === "number" && typeof diya.lat === "number") {
        lng = diya.lng;
        lat = diya.lat;
      } else if (diya.state) {
        const stateInfo = findStateInfo(diya.state);
        if (stateInfo) {
          stateName = stateInfo.name;
          const [cLng, cLat] = stateInfo.centroid;
          // Random jitter ~ ±0.5° around centroid
          const angle = seededRandom(seed * 7.1) * Math.PI * 2;
          const dist = seededRandom(seed * 13.7) * 0.5;
          lng = cLng + Math.cos(angle) * dist;
          lat = cLat + Math.sin(angle) * dist;
        } else {
          // Fallback to population hub
          const hub = INDIA_POPULATION_HUBS[seed % INDIA_POPULATION_HUBS.length];
          const angle = seededRandom(seed * 5.3) * Math.PI * 2;
          const dist = seededRandom(seed * 11.9) * 0.55;
          lng = hub[0] + Math.cos(angle) * dist;
          lat = hub[1] + Math.sin(angle) * dist;
        }
      } else {
        // Legacy diya without location: deterministic point inside India
        const hub = INDIA_POPULATION_HUBS[seed % INDIA_POPULATION_HUBS.length];
        const angle = seededRandom(seed * 17.1) * Math.PI * 2;
        const dist = seededRandom(seed * 23.3) * 0.65;
        const testLng = hub[0] + Math.cos(angle) * dist;
        const testLat = hub[1] + Math.sin(angle) * dist;

        if (geoContains(geoData, [testLng, testLat])) {
          lng = testLng;
          lat = testLat;
        } else {
          lng = hub[0];
          lat = hub[1];
        }
      }

      const projected = projection([lng, lat]);
      const x = projected ? projected[0] : dimensions.width / 2;
      const y = projected ? projected[1] : dimensions.height / 2;

      return {
        diya,
        lng,
        lat,
        x,
        y,
        seed,
        stateName,
      };
    });
  }, [diyas, projection, geoData, dimensions]);

  // 5. Camera focus when explicitly selecting a diya
  const lastHandledFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (!focusedPublicId || projectedDiyas.length === 0) return;
    if (lastHandledFocusRef.current === focusedPublicId) return;

    const target = projectedDiyas.find((p) => p.diya.publicId === focusedPublicId);
    if (target && canvasRef.current) {
      lastHandledFocusRef.current = focusedPublicId;
      const { width, height } = dimensions;
      const targetScale = Math.max(cameraRef.current.scale, 1.3);
      cameraRef.current.scale = targetScale;
      cameraRef.current.x = width / 2 - target.x * targetScale;
      cameraRef.current.y = height / 2 - target.y * targetScale;
    }
  }, [focusedPublicId, projectedDiyas, dimensions]);

  // 6. Main Rendering Loop (Map in world space, Diyas in crisp vector screen space)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !geoData || !projection || !pathGenerator) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning) return;

      animTimeRef.current = now * 0.003;
      const animTime = animTimeRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = dimensions.width;
      const height = dimensions.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Midnight crimson dark background
      ctx.fillStyle = "#140206";
      ctx.fillRect(0, 0, width, height);

      // Subtle, calm warm ambient light on whole country
      const ambientGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        60,
        width / 2,
        height / 2,
        width * 0.7
      );
      ambientGrad.addColorStop(0, "rgba(255, 140, 20, 0.04)");
      ambientGrad.addColorStop(0.6, "rgba(180, 50, 10, 0.02)");
      ambientGrad.addColorStop(1, "rgba(20, 2, 6, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // ─── Draw India Map Outline & States (in camera world space) ───
      ctx.save();
      ctx.translate(cameraRef.current.x, cameraRef.current.y);
      ctx.scale(cameraRef.current.scale, cameraRef.current.scale);

      ctx.fillStyle = "rgba(255, 160, 60, 0.035)";
      ctx.strokeStyle = "rgba(255, 180, 80, 0.32)";
      ctx.lineWidth = 1 / cameraRef.current.scale;

      pathGenerator.context(ctx);
      ctx.beginPath();
      pathGenerator(geoData);
      ctx.fill();
      ctx.stroke();

      ctx.restore(); // Restored to screen space!

      // ─── Draw Authentic Miniature Diyas (in crisp screen space) ───
      // When zooming, diya size scales gently with logarithm, keeping them legible without ballooning
      const currentZoom = cameraRef.current.scale;
      const baseDiyaSize = Math.min(Math.max(13 + Math.log2(currentZoom) * 4.5, 12), 23);

      for (let i = 0; i < projectedDiyas.length; i++) {
        const item = projectedDiyas[i];
        const { diya, seed } = item;

        // Calculate exact screen position
        const screenX = item.x * cameraRef.current.scale + cameraRef.current.x;
        const screenY = item.y * cameraRef.current.scale + cameraRef.current.y;

        // Viewport culling in screen coordinates
        if (screenX < -30 || screenX > width + 30 || screenY < -30 || screenY > height + 30) {
          continue;
        }

        const isFocused = focusedPublicId === diya.publicId;
        const isHovered = hoveredDiya?.diya.publicId === diya.publicId;

        // Filter dimming
        let dimFactor = 1.0;
        if (activeLanguage !== "all" && diya.locale !== activeLanguage) {
          dimFactor = 0.22;
        }

        // Soft, organic flame flicker per diya
        const flicker =
          0.85 +
          0.12 * Math.sin(animTime * 4.2 + seed * 1.618) +
          0.05 * Math.cos(animTime * 6.7 + seed * 2.718);

        const currentAlpha = Math.min(Math.max(flicker * dimFactor, 0.1), 1.0);

        // Draw 100% vector crisp diya
        drawCrispDiya(
          ctx,
          screenX,
          screenY,
          baseDiyaSize,
          diya.style,
          currentAlpha,
          isFocused,
          isHovered,
          animTime
        );
      }

      ctx.restore(); // restore dpr

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [
    geoData,
    projection,
    pathGenerator,
    projectedDiyas,
    dimensions,
    focusedPublicId,
    hoveredDiya,
    activeLanguage,
  ]);

  // 7. Hit Testing for nearest diya in screen coordinates
  const findClosestDiya = useCallback(
    (clientX: number, clientY: number, thresholdPx = 18) => {
      const canvas = canvasRef.current;
      if (!canvas || projectedDiyas.length === 0) return null;

      const rect = canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      let closest: ProjectedDiya | null = null;
      let minDistance = thresholdPx;
      let closestScreenX = 0;
      let closestScreenY = 0;

      for (let i = 0; i < projectedDiyas.length; i++) {
        const item = projectedDiyas[i];
        const screenX = item.x * cameraRef.current.scale + cameraRef.current.x;
        const screenY = item.y * cameraRef.current.scale + cameraRef.current.y;

        const dist = Math.hypot(mouseX - screenX, mouseY - (screenY - 4));
        if (dist < minDistance) {
          minDistance = dist;
          closest = item;
          closestScreenX = screenX;
          closestScreenY = screenY;
        }
      }

      if (closest) {
        return {
          diya: closest.diya,
          stateName: closest.stateName,
          screenX: closestScreenX,
          screenY: closestScreenY,
        };
      }

      return null;
    },
    [projectedDiyas]
  );

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.hasMoved = false;
    cameraRef.current.startX = e.clientX - cameraRef.current.x;
    cameraRef.current.startY = e.clientY - cameraRef.current.y;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (cameraRef.current.isDragging) {
      const newX = e.clientX - cameraRef.current.startX;
      const newY = e.clientY - cameraRef.current.startY;
      if (Math.hypot(newX - cameraRef.current.x, newY - cameraRef.current.y) > 4) {
        cameraRef.current.hasMoved = true;
      }
      cameraRef.current.x = newX;
      cameraRef.current.y = newY;
      if (hoveredDiya) setHoveredDiya(null);
    } else {
      const found = findClosestDiya(e.clientX, e.clientY, 16);
      setHoveredDiya(found);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    cameraRef.current.isDragging = false;

    // Click/tap detection
    if (!cameraRef.current.hasMoved) {
      const found = findClosestDiya(e.clientX, e.clientY, 22);
      if (found) {
        setHoveredDiya(found);
        onSelectDiya(found.diya);
      } else {
        setHoveredDiya(null);
      }
    }
  };

  const handlePointerLeave = () => {
    cameraRef.current.isDragging = false;
    setHoveredDiya(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const currentScale = cameraRef.current.scale;
    const newScale = Math.min(Math.max(currentScale * zoomFactor, 0.7), 4.5);

    cameraRef.current.x = mouseX - (mouseX - cameraRef.current.x) * (newScale / currentScale);
    cameraRef.current.y = mouseY - (mouseY - cameraRef.current.y) * (newScale / currentScale);
    cameraRef.current.scale = newScale;

    const found = findClosestDiya(e.clientX, e.clientY, 16);
    setHoveredDiya(found);
  };

  const resetView = () => {
    cameraRef.current.x = 0;
    cameraRef.current.y = 0;
    cameraRef.current.scale = 1;
    setHoveredDiya(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[68vh] sm:h-[78vh] overflow-hidden rounded-2xl border border-flame-400/25 bg-night-950 shadow-[0_0_35px_rgba(20,2,6,0.8)] select-none cursor-grab active:cursor-grabbing"
    >
      {/* Loading state for GeoJSON */}
      {geoLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-night-950/90 backdrop-blur-sm gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-flame-400 border-t-transparent animate-spin" />
          <p className="text-xs sm:text-sm text-flame-300 font-serif tracking-wide animate-pulse">
            Illuminating India&apos;s Sacred Map • अखंड भारत के दीप...
          </p>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
        className="w-full h-full block touch-none"
        aria-label="Map of India Diya Wall"
      />

      {/* Floating Interactive Hover Tooltip */}
      {hoveredDiya && (
        <div
          style={{
            left: `${Math.min(Math.max(hoveredDiya.screenX, 150), dimensions.width - 150)}px`,
            top: `${Math.max(hoveredDiya.screenY - 18, 85)}px`,
            transform: "translate(-50%, -100%)",
          }}
          className="absolute z-20 pointer-events-auto max-w-[280px] sm:max-w-xs bg-night-900/95 border border-flame-400/40 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,159,28,0.2)] text-left animate-fade-in transition-all"
        >
          <div className="flex items-center justify-between gap-2 border-b border-night-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-flame-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-flame-300">
                Diya #{hoveredDiya.diya.publicId}
              </span>
            </div>
            <span className="text-[10px] text-ivory-300/80 font-medium px-2 py-0.5 rounded-full bg-night-800 border border-night-700">
              📍 {[hoveredDiya.diya.city, hoveredDiya.stateName].filter(Boolean).join(", ")}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-serif italic text-ivory-50 line-clamp-3 leading-snug">
            &ldquo;{hoveredDiya.diya.wishText}&rdquo;
          </p>

          {hoveredDiya.diya.dedication && (
            <div className="mt-2 text-[10px] text-flame-300/90 font-medium">
              ✨ {hoveredDiya.diya.dedication}
            </div>
          )}

          <button
            type="button"
            onClick={() => onSelectDiya(hoveredDiya.diya)}
            className="w-full mt-2.5 py-1.5 rounded-lg bg-flame-400/15 hover:bg-flame-400/25 border border-flame-400/30 text-[11px] font-semibold text-flame-300 transition-colors text-center cursor-pointer"
          >
            Open Card / विस्तार से देखें 🪔
          </button>
        </div>
      )}

      {/* Floating Map Legend */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-0.5 text-[11px] text-ivory-300/80 bg-night-900/80 px-3.5 py-2 rounded-xl border border-night-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs">🪔</span>
          <span className="font-semibold text-ivory-100">Collective Light of India</span>
        </div>
        <span className="text-[10px] text-ivory-300/60 pl-5">
          {projectedDiyas.length} Diyas glowing across India
        </span>
      </div>

      {/* Instructions Overlay - Hidden on very small screens to prevent overlap, visible on sm+ */}
      <div className="absolute top-4 right-4 pointer-events-none hidden sm:block text-[11px] text-ivory-300/80 bg-night-900/80 px-3 py-1.5 rounded-lg border border-night-800 backdrop-blur-sm shadow">
        Hover or tap any diya • Drag to pan
      </div>

      {/* Zoom and Reset Controls: 44x44px min tap targets */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={resetView}
          className="min-h-[44px] px-3.5 rounded-xl bg-night-900/95 border border-night-750 text-ivory-200 text-xs font-medium hover:bg-night-800 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap flex items-center justify-center focus-visible:ring-2 focus-visible:ring-flame-400"
          title="Reset to whole India"
          aria-label="Reset India map view"
        >
          Reset View 🇮🇳
        </button>
        <button
          type="button"
          onClick={() => {
            cameraRef.current.scale = Math.min(cameraRef.current.scale * 1.3, 4.5);
          }}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-night-900/95 border border-night-750 text-ivory-100 flex items-center justify-center text-lg font-bold hover:bg-night-800 active:scale-95 transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-flame-400"
          title="Zoom in"
          aria-label="Zoom in map"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            cameraRef.current.scale = Math.max(cameraRef.current.scale * 0.77, 0.7);
          }}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-night-900/95 border border-night-750 text-ivory-100 flex items-center justify-center text-lg font-bold hover:bg-night-800 active:scale-95 transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-flame-400"
          title="Zoom out"
          aria-label="Zoom out map"
        >
          −
        </button>
      </div>
    </div>
  );
};
