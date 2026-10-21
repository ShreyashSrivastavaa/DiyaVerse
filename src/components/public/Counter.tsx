"use client";

import React, { useEffect, useState, useRef } from "react";

interface CounterProps {
  initialDiyasLit?: number;
  initialWishesShared?: number;
}

export const Counter: React.FC<CounterProps> = ({
  initialDiyasLit = 0,
  initialWishesShared = 0,
}) => {
  const [diyasLit, setDiyasLit] = useState<number>(initialDiyasLit);
  const [wishesShared, setWishesShared] = useState<number>(initialWishesShared);

  const [displayDiyas, setDisplayDiyas] = useState<number>(initialDiyasLit);
  const [displayWishes, setDisplayWishes] = useState<number>(initialWishesShared);

  const animRef = useRef<number | null>(null);

  // Poll counters every 30 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/public");
        if (res.ok) {
          const data = await res.json();
          setDiyasLit(data.diyasLit || 0);
          setWishesShared(data.wishesShared || 0);
        }
      } catch (err) {
        console.warn("Stats poll failed:", err);
      }
    };

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const prevDiyasRef = useRef(displayDiyas);
  const prevWishesRef = useRef(displayWishes);

  // 800ms ease-out count-up animation
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayDiyas(diyasLit);
      setDisplayWishes(wishesShared);
      prevDiyasRef.current = diyasLit;
      prevWishesRef.current = wishesShared;
      return;
    }

    const startDiyas = prevDiyasRef.current;
    const endDiyas = diyasLit;
    const startWishes = prevWishesRef.current;
    const endWishes = wishesShared;

    if (startDiyas === endDiyas && startWishes === endWishes) return;

    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentDiyaVal = Math.round(startDiyas + (endDiyas - startDiyas) * easeOut);
      const currentWishVal = Math.round(startWishes + (endWishes - startWishes) * easeOut);

      setDisplayDiyas(currentDiyaVal);
      setDisplayWishes(currentWishVal);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayDiyas(endDiyas);
        setDisplayWishes(endWishes);
        prevDiyasRef.current = endDiyas;
        prevWishesRef.current = endWishes;
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [diyasLit, wishesShared]);

  // When count is 0: show honest invitation without any number!
  if (diyasLit === 0) {
    return (
      <section
        aria-live="polite"
        className="my-6 px-4 py-6 max-w-xl mx-auto rounded-2xl bg-gradient-to-r from-night-900/60 via-night-850/80 to-night-900/60 border border-flame-400/20 text-center shadow-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">🪔</span>
          <span className="text-xs uppercase tracking-widest text-flame-400 font-semibold">
            The Flame Awaits
          </span>
        </div>
        <p className="text-lg sm:text-xl font-serif text-ivory-50 italic">
          Be the first to light a diya this Diwali.
        </p>
        <p className="text-xs text-ivory-300/70 mt-1 font-hindi">
          इस पावन पर्व पर सबसे पहले रोशनी की शुरुआत आप करें
        </p>
      </section>
    );
  }

  return (
    <section
      aria-live="polite"
      className="my-8 px-6 py-6 max-w-2xl mx-auto rounded-2xl bg-gradient-to-r from-night-900/80 via-night-850 to-night-900/80 border border-flame-400/30 text-center shadow-[0_0_25px_rgba(255,159,28,0.12)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-night-800">
        {/* Diyas Lit Counter */}
        <div className="flex flex-col items-center justify-center pt-2 sm:pt-0">
          <div className="text-3xl sm:text-4xl font-bold font-serif text-flame-300 tracking-tight">
            {displayDiyas.toLocaleString("en-IN")}
          </div>
          <span className="text-xs sm:text-sm font-medium text-ivory-200 mt-1">
            Diyas Lit Together 🪔
          </span>
          <span className="text-[11px] text-ivory-300/60 font-hindi">
            एक साथ प्रज्वलित दीये
          </span>
        </div>

        {/* Wishes Shared Counter */}
        <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
          <div className="text-3xl sm:text-4xl font-bold font-serif text-flame-400 tracking-tight">
            {displayWishes.toLocaleString("en-IN")}
          </div>
          <span className="text-xs sm:text-sm font-medium text-ivory-200 mt-1">
            Wishes Shared Across India ✨
          </span>
          <span className="text-[11px] text-ivory-300/60 font-hindi">
            शुभकामनाएं साझा की गईं
          </span>
        </div>
      </div>
    </section>
  );
};
