"use client";

import React from "react";
import Image from "next/image";

export interface DiyaVerseLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "flame" | "admin";
  layout?: "horizontal" | "stacked";
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { icon: 24, textWidth: 84, textHeight: 21, sub: "text-[8px]" },
  sm: { icon: 34, textWidth: 98, textHeight: 24, sub: "text-[9px]" },
  md: { icon: 44, textWidth: 122, textHeight: 30, sub: "text-[10px]" },
  lg: { icon: 60, textWidth: 168, textHeight: 42, sub: "text-xs" },
  xl: { icon: 84, textWidth: 236, textHeight: 58, sub: "text-sm" },
};

export const DiyaVerseLogo: React.FC<DiyaVerseLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
  variant = "flame",
  layout = "horizontal",
  priority = false,
}) => {
  const config = SIZE_MAP[size];

  if (layout === "stacked" && showText) {
    const stackedWidth = config.icon * 3;
    return (
      <div className={`inline-flex flex-col items-center select-none group ${className}`}>
        <div className="relative transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/logo-transparent.png"
            alt="DiyaVerse"
            width={stackedWidth}
            height={stackedWidth}
            priority={priority}
            className="w-auto drop-shadow-[0_0_16px_rgba(255,159,28,0.4)]"
            style={{ height: `${stackedWidth}px` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none group ${className}`}>
      {/* Sacred Diya Emblem */}
      <div
        className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: `${config.icon}px`, height: `${config.icon}px` }}
      >
        <Image
          src="/logo-emblem.png"
          alt="DiyaVerse Sacred Diya Emblem"
          width={config.icon * 2}
          height={config.icon * 2}
          priority={priority}
          className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,159,28,0.5)]"
        />
      </div>

      {/* Brand Typography & Subtitle */}
      {showText && (
        <div className="flex flex-col text-left leading-none justify-center">
          <div
            className="relative"
            style={{ width: `${config.textWidth}px`, height: `${config.textHeight}px` }}
          >
            <Image
              src="/logo-text.png"
              alt="DiyaVerse"
              width={config.textWidth * 2}
              height={config.textHeight * 2}
              priority={priority}
              className={`w-full h-full object-contain ${
                variant === "admin" ? "brightness-125 contrast-110" : ""
              }`}
            />
          </div>
          <span
            className={`font-devanagari font-medium tracking-widest uppercase transition-colors pl-0.5 mt-0.5 ${config.sub} ${
              variant === "admin" ? "text-slate-400" : "text-flame-400/80"
            }`}
          >
            अखंड दीप
          </span>
        </div>
      )}
    </div>
  );
};

