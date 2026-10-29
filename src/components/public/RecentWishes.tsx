"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";

interface RecentDiya {
  publicId: string;
  style: string;
  wishText: string;
  dedication: string | null;
  createdAt: string;
}

interface RecentWishesProps {
  initialDiyas?: RecentDiya[];
}

export const RecentWishes: React.FC<RecentWishesProps> = ({ initialDiyas = [] }) => {
  const [diyas, setDiyas] = useState<RecentDiya[]>(initialDiyas);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/diyas/recent");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.diyas)) {
            setDiyas(data.diyas);
          }
        }
      } catch (err) {
        console.warn("Recent wishes poll failed:", err);
      }
    };

    // If initial is empty, fetch immediately
    if (initialDiyas.length === 0) {
      fetchRecent();
    }

    const interval = setInterval(fetchRecent, 30000);
    return () => clearInterval(interval);
  }, [initialDiyas.length]);

  // Hidden entirely if there are no diyas yet!
  if (diyas.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-flame-400 font-bold mb-1">
            Glow of Unity
          </h2>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
            Recent Wishes from Across India
          </p>
        </div>
        <Link
          href="/wall"
          className="text-sm font-semibold text-flame-400 hover:text-flame-300 transition-colors inline-flex items-center gap-1 group min-h-[44px]"
        >
          <span>View All on Diya Wall</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {diyas.map((diya) => (
          <Link
            key={diya.publicId}
            href={`/d/${diya.publicId}`}
            className="p-5 rounded-2xl bg-night-900/60 border border-night-800 hover:border-flame-400/40 hover:bg-night-850/80 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-[0_0_20px_rgba(255,159,28,0.12)] min-h-[140px]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-8 flex items-center justify-center">
                  <DiyaSprite style={diya.style as DiyaStyle} size="sm" isLit={true} />
                </div>
                {diya.dedication && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-flame-400/10 text-flame-300 border border-flame-400/20">
                    {diya.dedication}
                  </span>
                )}
              </div>
              <p className="text-base font-serif italic text-ivory-100 group-hover:text-flame-200 transition-colors line-clamp-3 leading-relaxed">
                &ldquo;{diya.wishText}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-night-800/80 flex items-center justify-between text-[11px] text-ivory-300/50 font-mono">
              <span>Diya #{diya.publicId}</span>
              <span>
                {new Date(diya.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
