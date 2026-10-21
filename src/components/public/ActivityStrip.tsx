"use client";

import React, { useEffect, useState } from "react";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";
import { WallDiya } from "./WallCanvas";

interface ActivityStripProps {
  onSelectDiya: (diya: WallDiya) => void;
}

export const ActivityStrip: React.FC<ActivityStripProps> = ({ onSelectDiya }) => {
  const [recentDiyas, setRecentDiyas] = useState<WallDiya[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/wall?limit=10");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.diyas)) {
            setRecentDiyas(data.diyas);
          }
        }
      } catch (err) {
        console.warn("Activity strip fetch failed:", err);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  if (recentDiyas.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-night-900/60 border border-night-800 rounded-2xl p-3 my-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="w-2 h-2 rounded-full bg-flame-400 animate-pulse" />
        <span className="text-[11px] uppercase font-bold tracking-wider text-flame-300">
          Recent Activity Strip
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {recentDiyas.map((diya) => (
          <button
            key={diya.publicId}
            type="button"
            onClick={() => onSelectDiya(diya)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-night-850 hover:bg-night-800 border border-night-750 transition-all text-left cursor-pointer min-h-[40px] max-w-[240px]"
          >
            <div className="w-6 h-5 flex-shrink-0 flex items-center justify-center">
              <DiyaSprite style={diya.style as DiyaStyle} size="sm" isLit={true} />
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs text-ivory-100 font-serif italic truncate">
                &ldquo;{diya.wishText}&rdquo;
              </span>
              <span className="block text-[10px] text-ivory-300/50 font-mono">
                #{diya.publicId}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
