"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SparkParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
}

interface MatchstickProps {
  targetX: number;
  targetY: number;
  isIgniting: boolean;
  onIgnitionComplete?: () => void;
}

export const MatchstickIgniter: React.FC<MatchstickProps> = ({
  targetX,
  targetY,
  isIgniting,
  onIgnitionComplete,
}) => {
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const sparkIdCounter = useRef(0);

  // Trigger burst of Diwali golden sparks when the matchstick touches the wick
  useEffect(() => {
    if (isIgniting && targetX > 0 && targetY > 0) {
      const colors = ["#FFF9C4", "#FFD54F", "#FFB300", "#FF8F00", "#FF6F00", "#FFF"];
      const newSparks: SparkParticle[] = [];
      const count = 16; // 16 celebratory spark particles

      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = 25 + Math.random() * 45;
        newSparks.push({
          id: ++sparkIdCounter.current,
          x: targetX,
          y: targetY,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 15, // bias upwards
          size: 2 + Math.random() * 3.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setSparks(newSparks);

      const timer = setTimeout(() => {
        setSparks([]);
        onIgnitionComplete?.();
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isIgniting, targetX, targetY, onIgnitionComplete]);

  if (!isIgniting && sparks.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* 1. Flying & Striking Matchstick */}
      <AnimatePresence>
        {isIgniting && targetX > 0 && (
          <motion.div
            initial={{
              x: targetX + 50,
              y: targetY - 60,
              rotate: -45,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              x: [targetX + 50, targetX + 4, targetX + 2, targetX + 25],
              y: [targetY - 60, targetY + 2, targetY, targetY - 30],
              rotate: [-45, -28, -25, -35],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.9],
            }}
            transition={{
              duration: 0.65,
              times: [0, 0.45, 0.7, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute top-0 left-0"
            style={{ transformOrigin: "0 0" }}
          >
            {/* Realistic Wooden Matchstick SVG with Glowing Flame Tip */}
            <div className="relative w-24 h-6 -translate-x-3 -translate-y-3">
              {/* Flame on Matchstick Tip */}
              <div className="absolute left-1 top-0.5 -translate-y-full -translate-x-1 flex items-center justify-center">
                {/* Flame Halo Glow */}
                <div className="absolute w-8 h-8 rounded-full bg-flame-400/30 blur-md animate-pulse" />

                <svg width="22" height="30" viewBox="0 0 24 32" fill="none" className="overflow-visible">
                  <defs>
                    <linearGradient id="matchFlame" x1="12" y1="2" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="25%" stopColor="#FFF176" />
                      <stop offset="60%" stopColor="#FF9800" />
                      <stop offset="100%" stopColor="#E65100" />
                    </linearGradient>
                  </defs>
                  {/* Outer flame */}
                  <path
                    d="M12 2 C16 9, 21 16, 21 22 C21 27, 17 30, 12 30 C7 30, 3 27, 3 22 C3 16, 8 9, 12 2 Z"
                    fill="url(#matchFlame)"
                  />
                  {/* Inner flame */}
                  <path
                    d="M12 9 C14 14, 17 18, 17 22 C17 25, 14.5 27, 12 27 C9.5 27, 7 25, 7 22 C7 18, 10 14, 12 9 Z"
                    fill="#FFFDE7"
                    opacity="0.9"
                  />
                </svg>
              </div>

              {/* Wooden Stick & Match Head */}
              <svg width="80" height="12" viewBox="0 0 80 12" fill="none">
                {/* Wooden Shaft */}
                <rect x="10" y="3.5" width="70" height="5" rx="1.5" fill="#D7A15C" stroke="#A67035" strokeWidth="0.6" />
                <rect x="10" y="4.5" width="70" height="1.5" fill="#E8BD83" opacity="0.6" />
                {/* Burnt Transition */}
                <rect x="7" y="3" width="7" height="6" rx="1" fill="#422517" />
                {/* Dark Sulphur Head */}
                <ellipse cx="6" cy="6" rx="6" ry="4.5" fill="#24120C" />
                <ellipse cx="5" cy="5" rx="3.5" ry="2.5" fill="#D32F2F" opacity="0.4" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Burst of Golden Diwali Sparks upon Touching the Wick */}
      {sparks.map((s) => (
        <motion.div
          key={s.id}
          initial={{
            x: s.x,
            y: s.y,
            scale: 0.5,
            opacity: 1,
          }}
          animate={{
            x: s.x + s.dx,
            y: s.y + s.dy,
            scale: [0.5, 1.2, 0],
            opacity: [1, 0.9, 0],
          }}
          transition={{
            duration: 0.55 + Math.random() * 0.15,
            ease: [0.25, 1, 0.5, 1],
          }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 6px ${s.color}`,
          }}
        />
      ))}
    </div>
  );
};
