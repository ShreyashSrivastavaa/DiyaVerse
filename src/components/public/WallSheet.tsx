"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";
import { ReportDialog } from "./ReportDialog";
import { WallDiya } from "./WallCanvas";

interface WallSheetProps {
  diya: WallDiya | null;
  onClose: () => void;
}

export const WallSheet: React.FC<WallSheetProps> = ({ diya, onClose }) => {
  const [reportOpen, setReportOpen] = useState(false);

  if (!diya) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-night-900 border-t border-flame-400/30 rounded-t-3xl p-6 sm:p-8 shadow-2xl animate-slide-up text-left space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-night-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 flex items-center justify-center">
              <DiyaSprite style={diya.style as DiyaStyle} size="sm" isLit={true} />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-flame-400">
                Diya #{diya.publicId}
              </span>
              <div className="text-[11px] text-ivory-300/50">
                {new Date(diya.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ivory-300/60 hover:text-ivory-100 p-2 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer text-lg"
            title="Close details"
          >
            ✕
          </button>
        </div>

        {/* Dedication and Location badges */}
        <div className="flex flex-wrap items-center gap-2">
          {diya.dedication && (
            <span className="inline-block px-3 py-0.5 rounded-full bg-flame-400/10 border border-flame-400/20 text-xs text-flame-300 font-medium">
              {diya.dedication}
            </span>
          )}
          {(diya.state || diya.city) && (
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-night-800 border border-night-700 text-xs text-ivory-300 font-medium">
              📍 {[diya.city, diya.state].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        {/* Wish content */}
        <blockquote className="text-lg sm:text-xl font-serif text-ivory-50 italic leading-relaxed">
          &ldquo;{diya.wishText}&rdquo;
        </blockquote>

        {/* Action triggers */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href={`/light?ref=wall&src=d_${diya.publicId}`}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all text-center min-h-[44px] flex items-center justify-center shadow"
          >
            Light Your Own Diya 🪔
          </Link>
          <Link
            href={`/d/${diya.publicId}`}
            className="w-full sm:w-auto py-3 px-4 rounded-xl font-medium text-sm text-ivory-200 bg-night-850 hover:bg-night-800 border border-night-700 transition-colors text-center min-h-[44px] flex items-center justify-center"
          >
            Open Card
          </Link>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="text-xs text-ivory-300/40 hover:text-ivory-300/80 underline cursor-pointer"
          >
            Report this wish
          </button>
        </div>
      </div>

      {reportOpen && (
        <ReportDialog
          diyaPublicId={diya.publicId}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
};
