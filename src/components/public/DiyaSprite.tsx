import React from "react";
import { clsx } from "clsx";

export type DiyaStyle = "clay" | "marigold" | "rangoli" | "golden" | "lotus";

interface DiyaSpriteProps {
  style?: DiyaStyle;
  size?: "sm" | "md" | "lg" | "hero";
  isLit?: boolean;
  className?: string;
}

export const DIYA_STYLES: { id: DiyaStyle; name: string; description: string }[] = [
  { id: "clay", name: "Classic Clay", description: "Traditional terracotta diya" },
  { id: "marigold", name: "Marigold", description: "Bordered with fresh festive petals" },
  { id: "rangoli", name: "Rangoli", description: "Adorned with geometric kolam patterns" },
  { id: "golden", name: "Golden Brass", description: "Gleaming metallic temple brass" },
  { id: "lotus", name: "Lotus", description: "Resting gracefully on blooming lotus petals" },
];

export function DiyaSprite({
  style = "clay",
  size = "md",
  isLit = true,
  className = "",
}: DiyaSpriteProps) {
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    hero: "w-48 h-48 sm:w-64 sm:h-64",
  };

  return (
    <div
      className={clsx(
        "relative flex items-center justify-center select-none",
        sizeMap[size],
        className,
      )}
      role="img"
      aria-label={`${DIYA_STYLES.find((s) => s.id === style)?.name || style} Diya${
        isLit ? " (Lit)" : " (Unlit)"
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Flame Glow Filter */}
          <filter id="flame-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial Glow for Ambient Light */}
          <radialGradient id="ambient-glow" cx="50%" cy="35%" r="45%">
            <stop offset="0%" stopColor="#FFD98A" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#FF9F1C" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#E8590C" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0B1030" stopOpacity="0" />
          </radialGradient>

          {/* Flame Gradients */}
          <linearGradient id="flame-outer" x1="50" y1="12" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFEFB8" />
            <stop offset="35%" stopColor="#FFC857" />
            <stop offset="75%" stopColor="#FF9F1C" />
            <stop offset="100%" stopColor="#E8590C" />
          </linearGradient>

          <linearGradient id="flame-inner" x1="50" y1="22" x2="50" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF3B0" />
            <stop offset="100%" stopColor="#FFB703" />
          </linearGradient>

          {/* Diya Base Gradients */}
          {/* 1. Clay Gradient */}
          <linearGradient id="clay-base" x1="50" y1="45" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C85A32" />
            <stop offset="50%" stopColor="#9C3D1A" />
            <stop offset="100%" stopColor="#6E260D" />
          </linearGradient>
          <linearGradient id="clay-rim" x1="20" y1="52" x2="80" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DE7952" />
            <stop offset="50%" stopColor="#FF9E79" />
            <stop offset="100%" stopColor="#B34720" />
          </linearGradient>

          {/* 2. Golden Brass Gradient */}
          <linearGradient id="brass-base" x1="25" y1="45" x2="75" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="30%" stopColor="#FFCA28" />
            <stop offset="70%" stopColor="#FF8F00" />
            <stop offset="100%" stopColor="#B56000" />
          </linearGradient>

          {/* 3. Lotus Gradient */}
          <linearGradient id="lotus-petal" x1="50" y1="60" x2="50" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B8B" />
            <stop offset="60%" stopColor="#D81B60" />
            <stop offset="100%" stopColor="#880E4F" />
          </linearGradient>

          {/* 4. Marigold Gradient */}
          <linearGradient id="marigold-petal" x1="50" y1="55" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFCA28" />
            <stop offset="50%" stopColor="#FF9800" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>

          {/* 5. Rangoli base gradient */}
          <linearGradient id="rangoli-base" x1="20" y1="45" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7E57C2" />
            <stop offset="50%" stopColor="#5E35B1" />
            <stop offset="100%" stopColor="#311B92" />
          </linearGradient>
        </defs>

        {/* Dynamic Ambient Background Glow when lit */}
        {isLit && (
          <circle
            cx="50"
            cy="35"
            r="42"
            fill="url(#ambient-glow)"
            className="animate-glowPulse pointer-events-none"
          />
        )}

        {/* Base according to chosen style */}
        <g id="diya-base">
          {style === "clay" && (
            <g>
              {/* Stand/Pedestal */}
              <ellipse cx="50" cy="80" rx="18" ry="4" fill="#501C0A" opacity="0.6" />
              <path d="M42 75 L40 80 L60 80 L58 75 Z" fill="#7A2D12" />
              {/* Main Bowl */}
              <path
                d="M18 52 C22 75, 42 82, 50 82 C58 82, 78 75, 82 52 C74 58, 58 60, 50 60 C42 60, 26 58, 18 52 Z"
                fill="url(#clay-base)"
              />
              {/* Rim highlight */}
              <path
                d="M18 52 C26 57, 40 59, 50 59 C60 59, 74 57, 82 52 C74 48, 60 46, 50 46 C40 46, 26 48, 18 52 Z"
                fill="url(#clay-rim)"
              />
              {/* Oil Pool */}
              <ellipse cx="50" cy="53" rx="26" ry="5.5" fill="#58210D" />
            </g>
          )}

          {style === "marigold" && (
            <g>
              {/* Petal Collar */}
              <ellipse cx="50" cy="82" rx="22" ry="5" fill="#421E06" opacity="0.6" />
              <g fill="url(#marigold-petal)">
                <circle cx="24" cy="56" r="7" />
                <circle cx="34" cy="65" r="7.5" />
                <circle cx="50" cy="70" r="8" />
                <circle cx="66" cy="65" r="7.5" />
                <circle cx="76" cy="56" r="7" />
                <circle cx="30" cy="52" r="6" />
                <circle cx="70" cy="52" r="6" />
              </g>
              {/* Inner terracotta vessel */}
              <path
                d="M26 50 C30 68, 44 74, 50 74 C56 74, 70 68, 74 50 C68 55, 56 57, 50 57 C44 57, 32 55, 26 50 Z"
                fill="url(#clay-base)"
              />
              <ellipse cx="50" cy="50" rx="23" ry="5.5" fill="#782E12" />
            </g>
          )}

          {style === "rangoli" && (
            <g>
              {/* Rangoli Radial Base */}
              <ellipse cx="50" cy="82" rx="24" ry="6" fill="#1C103A" opacity="0.7" />
              <path
                d="M14 62 L24 72 L36 78 L50 80 L64 78 L76 72 L86 62 L74 65 L60 68 L50 69 L40 68 L26 65 Z"
                fill="#FFC857"
              />
              {/* Geometric pattern petals */}
              <path
                d="M20 54 C25 76, 42 82, 50 82 C58 82, 75 76, 80 54 C72 60, 58 62, 50 62 C42 62, 28 60, 20 54 Z"
                fill="url(#rangoli-base)"
              />
              <ellipse cx="50" cy="53" rx="28" ry="6" fill="#9C27B0" opacity="0.9" />
              {/* Fine White Dots */}
              <circle cx="35" cy="63" r="1.5" fill="#FFF8EB" />
              <circle cx="42" cy="67" r="1.5" fill="#FFF8EB" />
              <circle cx="50" cy="69" r="1.8" fill="#FFF8EB" />
              <circle cx="58" cy="67" r="1.5" fill="#FFF8EB" />
              <circle cx="65" cy="63" r="1.5" fill="#FFF8EB" />
              <ellipse cx="50" cy="53" rx="22" ry="4.5" fill="#4A148C" />
            </g>
          )}

          {style === "golden" && (
            <g>
              {/* Metallic Base & Stem */}
              <ellipse cx="50" cy="84" rx="22" ry="5" fill="#4A3402" opacity="0.6" />
              <path d="M38 80 C40 82, 60 82, 62 80 L56 72 L44 72 Z" fill="#B56000" />
              <path d="M45 72 L45 66 L55 66 L55 72 Z" fill="#FFB300" />
              {/* Brass Diya Bowl */}
              <path
                d="M16 50 C22 72, 42 78, 50 78 C58 78, 78 72, 84 50 C74 56, 58 58, 50 58 C42 58, 26 56, 16 50 Z"
                fill="url(#brass-base)"
              />
              <path
                d="M16 50 C26 55, 40 57, 50 57 C60 57, 74 55, 84 50 C74 46, 60 44, 50 44 C40 44, 26 46, 16 50 Z"
                fill="#FFF176"
              />
              <ellipse cx="50" cy="50" rx="28" ry="5.5" fill="#E65100" />
              <ellipse cx="50" cy="50" rx="24" ry="4" fill="#FFB300" opacity="0.6" />
            </g>
          )}

          {style === "lotus" && (
            <g>
              {/* Lotus Petal Platform */}
              <ellipse cx="50" cy="84" rx="26" ry="6" fill="#38091E" opacity="0.6" />
              {/* Outer blooming petals */}
              <path
                d="M12 60 C18 78, 36 86, 50 86 C64 86, 82 78, 88 60 C80 72, 65 78, 50 78 C35 78, 20 72, 12 60 Z"
                fill="url(#lotus-petal)"
              />
              <g fill="#F06292">
                <path d="M22 68 C28 78, 38 84, 50 84 C38 82, 28 76, 22 68 Z" />
                <path d="M78 68 C72 78, 62 84, 50 84 C62 82, 72 76, 78 68 Z" />
              </g>
              {/* Central golden-pink diya receptacle */}
              <path
                d="M24 50 C28 66, 42 72, 50 72 C58 72, 72 66, 76 50 C68 54, 58 56, 50 56 C42 56, 32 54, 24 50 Z"
                fill="url(#clay-base)"
              />
              <ellipse cx="50" cy="49" rx="22" ry="5" fill="#6A1B29" />
            </g>
          )}

          {/* Wick */}
          <path
            d="M49 52 C49 46, 50 43, 50 41 C50 43, 51 46, 51 52 Z"
            fill="#261C14"
            stroke="#120B06"
            strokeWidth="0.8"
          />
        </g>

        {/* Animated Flame with flicker (only when lit) */}
        {isLit && (
          <g id="diya-flame" className="origin-[50px_42px] animate-flicker">
            {/* Outer Flame */}
            <path
              d="M50 10 C43 24, 37 32, 40 40 C43 47, 57 47, 60 40 C63 32, 57 24, 50 10 Z"
              fill="url(#flame-outer)"
              filter="url(#flame-glow)"
            />
            {/* Inner Flame Core */}
            <path
              d="M50 20 C46 27, 43 32, 45 38 C47 42, 53 42, 55 38 C57 32, 54 27, 50 20 Z"
              fill="url(#flame-inner)"
            />
            {/* White-hot spark core */}
            <ellipse cx="50" cy="37" rx="2.5" ry="4" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
      </svg>
    </div>
  );
}
