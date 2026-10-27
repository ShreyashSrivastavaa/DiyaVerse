"use client";

import React from "react";

interface DiyaVerseLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "flame" | "admin";
}

const SIZE_MAP = {
  xs: { icon: 20, text: "text-base", sub: "text-[9px]" },
  sm: { icon: 28, text: "text-lg", sub: "text-[10px]" },
  md: { icon: 36, text: "text-xl", sub: "text-xs" },
  lg: { icon: 48, text: "text-2xl", sub: "text-sm" },
  xl: { icon: 64, text: "text-4xl", sub: "text-base" },
};

export const DiyaVerseLogo: React.FC<DiyaVerseLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  variant = "flame",
}) => {
  const { icon, text } = SIZE_MAP[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Sacred Diya & Cosmic Aura SVG Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="DiyaVerse Emblem"
        className="flex-shrink-0 drop-shadow-[0_0_12px_rgba(255,159,28,0.45)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id="flameOuter" x1="24" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="35%" stopColor="#FF9F1C" />
            <stop offset="100%" stopColor="#E71D36" />
          </linearGradient>

          {/* Inner Flame Core */}
          <linearGradient id="flameInner" x1="24" y1="10" x2="24" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFE49E" />
            <stop offset="100%" stopColor="#FF9F1C" />
          </linearGradient>

          {/* Diya Bowl Gradient */}
          <linearGradient id="diyaBowl" x1="8" y1="26" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Golden Rim Highlight */}
          <linearGradient id="goldenRim" x1="8" y1="26" x2="40" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* Cosmic Ring Aura */}
          <radialGradient id="cosmicGlow" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
            <stop offset="65%" stopColor="#FF9F1C" stopOpacity="0.25" />
            <stop offset="90%" stopColor="#FFD700" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Cosmic Halo */}
        <circle cx="24" cy="24" r="21" fill="url(#cosmicGlow)" />
        <circle
          cx="24"
          cy="24"
          r="20.5"
          stroke="url(#goldenRim)"
          strokeWidth="0.8"
          strokeDasharray="2.5 3"
          strokeOpacity="0.6"
        />

        {/* Constellation Sparkles / Celestial Lights */}
        <circle cx="7" cy="18" r="1" fill="#FFE49E" opacity="0.8" />
        <circle cx="41" cy="18" r="1" fill="#FFE49E" opacity="0.8" />
        <circle cx="12" cy="10" r="1.2" fill="#FFF275" opacity="0.9" />
        <circle cx="36" cy="10" r="1.2" fill="#FFF275" opacity="0.9" />
        <path d="M24 2 L25 5 L28 6 L25 7 L24 10 L23 7 L20 6 L23 5 Z" fill="#FFF9C4" opacity="0.9" />

        {/* Diya Clay Bowl */}
        <path
          d="M6 26 C6 37 14 43 24 43 C34 43 42 37 42 26 C42 25 40 24.5 38 25 C31 27 17 27 10 25 C8 24.5 6 25 6 26 Z"
          fill="url(#diyaBowl)"
        />

        {/* Diya Rim Ring */}
        <ellipse cx="24" cy="26" rx="16" ry="3.5" fill="none" stroke="url(#goldenRim)" strokeWidth="1.2" />

        {/* Main Sacred Flame */}
        <path
          d="M24 5 C27.5 12 32 17 32 23 C32 28 28.4 31 24 31 C19.6 31 16 28 16 23 C16 17 20.5 12 24 5 Z"
          fill="url(#flameOuter)"
        />

        {/* Inner Flame Core */}
        <path
          d="M24 11 C26 15.5 28.5 18.5 28.5 23 C28.5 26 26.5 28 24 28 C21.5 28 19.5 26 19.5 23 C19.5 18.5 22 15.5 24 11 Z"
          fill="url(#flameInner)"
        />

        {/* White-hot Core Pinpoint */}
        <ellipse cx="24" cy="23" rx="1.5" ry="3" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center">
            <span
              className={`font-serif font-extrabold tracking-tight ${text} ${
                variant === "admin"
                  ? "text-slate-100"
                  : "text-flame-400"
              }`}
            >
              Diya
            </span>
            <span
              className={`font-serif font-bold tracking-normal ${text} ${
                variant === "admin" ? "text-flame-300" : "text-ivory-50"
              }`}
            >
              Verse
            </span>
          </div>
          <span className="text-[9px] font-sans font-medium text-flame-400/80 tracking-wider uppercase">
            अखंड दीप
          </span>
        </div>
      )}
    </div>
  );
};
