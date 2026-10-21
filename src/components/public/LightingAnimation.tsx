"use client";

import React, { useEffect, useState } from "react";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";

interface LightingAnimationProps {
  style: DiyaStyle;
  wishText: string;
  dedicationText?: string | null;
  onComplete: () => void;
}

export const LightingAnimation: React.FC<LightingAnimationProps> = ({
  style,
  wishText,
  dedicationText,
  onComplete,
}) => {
  // Step 0: unlit, Step 1: wick glow, Step 2: flame scales, Step 3: radial glow & wish reveal
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    // Check prefers-reduced-motion and saveData
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Check saveData
    const isSaveData =
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    if (prefersReducedMotion || isSaveData) {
      setStep(3);
      const timer = setTimeout(() => {
        onComplete();
      }, 250);
      return () => clearTimeout(timer);
    }

    // 1.6s choreograph sequence
    // 0ms: Unlit diya
    // 350ms: Wick glows
    const t1 = setTimeout(() => setStep(1), 350);
    // 750ms: Flame scales up
    const t2 = setTimeout(() => setStep(2), 750);
    // 1200ms: Soft radial glow expands & wish fades in
    const t3 = setTimeout(() => setStep(3), 1200);
    // 1800ms: Complete and transition to success screen
    const t4 = setTimeout(() => onComplete(), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4 text-center min-h-[380px]">
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft radial glow expanding */}
        <div
          className={`absolute w-72 h-72 rounded-full bg-radial from-flame-400/25 via-flame-500/10 to-transparent blur-2xl pointer-events-none transition-opacity duration-700 ease-out ${
            step >= 2 ? "opacity-100 scale-110" : "opacity-0 scale-50"
          }`}
          style={{ willChange: "transform, opacity" }}
        />

        {/* Diya representation */}
        <div
          className={`transition-all duration-500 ease-out ${
            step >= 1 ? "scale-105" : "scale-100 opacity-70"
          }`}
          style={{ willChange: "transform, opacity" }}
        >
          <DiyaSprite
            style={style}
            size="hero"
            isLit={step >= 2}
            className={step === 1 ? "brightness-125 transition-all" : ""}
          />
        </div>

        {/* Wick glow indicator in step 1 */}
        {step === 1 && (
          <div className="absolute top-[38px] w-3 h-3 rounded-full bg-flame-300 animate-ping opacity-75" />
        )}
      </div>

      {/* Lighting status text */}
      <div className="mt-8 h-8 flex items-center justify-center">
        {step < 2 ? (
          <span className="text-sm font-medium text-flame-300/80 animate-pulse">
            Kindling sacred wick...
          </span>
        ) : (
          <span className="text-sm font-medium text-flame-400 transition-opacity duration-300">
            Diya is glowing bright!
          </span>
        )}
      </div>

      {/* Dedication and Wish reveal in step 3 */}
      <div
        className={`max-w-md mt-4 transition-all duration-500 ease-out ${
          step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        {dedicationText && (
          <span className="inline-block text-xs uppercase tracking-wider text-flame-300/90 font-medium mb-1">
            {dedicationText}
          </span>
        )}
        <p className="text-lg font-serif text-ivory-50 italic px-4">
          &ldquo;{wishText}&rdquo;
        </p>
      </div>
    </div>
  );
};
