"use client";

import React from "react";
import Link from "next/link";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";
import { WallDiya } from "./WallCanvas";

interface WallListProps {
  diyas: WallDiya[];
  onSelectDiya: (diya: WallDiya) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export const WallList: React.FC<WallListProps> = ({
  diyas,
  onSelectDiya,
  onLoadMore,
  hasMore,
  loading,
}) => {
  if (diyas.length === 0 && !loading) {
    return (
      <div className="py-16 text-center text-ivory-300/60 bg-night-900/40 rounded-2xl border border-night-800">
        <span className="text-3xl block mb-2">🪔</span>
        <p className="text-sm">No diyas found for this filter.</p>
        <Link href="/light" className="text-xs text-flame-400 underline mt-2 inline-block">
          Be the first to light one!
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {diyas.map((diya) => (
          <div
            key={diya.publicId}
            onClick={() => onSelectDiya(diya)}
            className="p-5 rounded-2xl bg-night-900/70 border border-night-800 hover:border-flame-400/40 hover:bg-night-850/80 transition-all cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-[0_0_20px_rgba(255,159,28,0.1)] focus:ring-2 focus:ring-flame-400 outline-none"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectDiya(diya);
              }
            }}
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
              <p className="text-sm font-serif italic text-ivory-100 group-hover:text-flame-200 transition-colors line-clamp-3 leading-relaxed">
                &ldquo;{diya.wishText}&rdquo;
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-night-800 flex items-center justify-between text-[11px] text-ivory-300/50 font-mono">
              <span>Diya #{diya.publicId}</span>
              <span>
                {new Date(diya.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-night-850 hover:bg-night-800 border border-night-700 text-sm font-medium text-ivory-200 transition-colors min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            {loading ? "Loading more lights..." : "Load More Diyas"}
          </button>
        </div>
      )}
    </div>
  );
};
