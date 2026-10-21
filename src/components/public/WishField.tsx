"use client";

import React, { useState } from "react";
import { graphemeCount } from "@/lib/text";
import { trackEvent } from "@/lib/analytics/client";

interface WishFieldProps {
  wishText: string;
  onWishTextChange: (text: string) => void;
  previewWish: { id: string; text: string; language: string } | null;
  onPreviewWishChange: (wish: { id: string; text: string; language: string } | null) => void;
  locale: string;
  disabled?: boolean;
}

export const WishField: React.FC<WishFieldProps> = ({
  wishText,
  onWishTextChange,
  previewWish,
  onPreviewWishChange,
  locale,
  disabled,
}) => {
  const [loadingSurprise, setLoadingSurprise] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const currentGraphemes = graphemeCount(wishText);
  const maxGraphemes = 140;

  const handleSurpriseMe = async () => {
    if (disabled || loadingSurprise) return;
    setLoadingSurprise(true);
    trackEvent("surprise_me_clicked", {}, locale);

    try {
      const excludeParam = recentIds.slice(-20).join(",");
      const res = await fetch(`/api/wishes/random?locale=${encodeURIComponent(locale)}&exclude=${encodeURIComponent(excludeParam)}`);
      if (res.ok) {
        const data = await res.json();
        const picked = data.wish || (data.text ? data : null);
        if (picked && picked.text) {
          onWishTextChange(picked.text);
          onPreviewWishChange(picked);
          setRecentIds((prev) => [...prev.slice(-19), picked.id]);
        }
      }
    } catch (e) {
      console.error("Surprise Me failed:", e);
    } finally {
      setLoadingSurprise(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (graphemeCount(val) <= maxGraphemes) {
      onWishTextChange(val);
      if (val.trim() && previewWish) {
        // If user writes their own text, the custom wish takes precedence over preview wish
        onPreviewWishChange(null);
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="wish-input" className="block text-sm font-medium text-ivory-300">
          2. Attach a Wish / शुभकामना लिखें (वैकल्पिक)
        </label>
        <span
          className={`text-xs font-mono transition-colors ${
            currentGraphemes > 130 ? "text-flame-400 font-bold" : "text-ivory-300/60"
          }`}
        >
          {currentGraphemes}/{maxGraphemes}
        </span>
      </div>

      <div className="relative">
        <textarea
          id="wish-input"
          value={wishText}
          onChange={handleTextChange}
          disabled={disabled}
          rows={3}
          maxLength={300} // HTML fallback, grapheme enforced via handler
          placeholder="Write your wish, or leave it blank and we'll choose one for you."
          className="w-full px-4 py-3 bg-white text-slate-950 font-medium border-2 border-flame-400 rounded-xl placeholder-slate-500 text-base focus:border-flame-500 focus:ring-2 focus:ring-flame-400/50 outline-none transition-all resize-none disabled:opacity-50 shadow-sm"
        />
      </div>

      {/* Surprise Me and Preview Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={handleSurpriseMe}
          disabled={disabled || loadingSurprise}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-plum-700/40 hover:bg-plum-700/70 border border-plum-700/60 text-flame-300 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          <span className="text-sm">✨</span>
          <span>{loadingSurprise ? "Finding blessing..." : "Surprise Me / सुझाव दें"}</span>
        </button>

        {!wishText.trim() && (
          <span className="text-xs text-ivory-300/60 italic">
            Blank wishes receive a curated wish from our library
          </span>
        )}
      </div>

      {/* Preview Wish Chip if selected and custom text is empty */}
      {previewWish && !wishText.trim() && (
        <div className="p-3 bg-night-850/90 border border-flame-400/40 rounded-xl flex items-start justify-between gap-3 animate-fade-in shadow-[0_0_15px_rgba(255,159,28,0.1)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-flame-400 bg-flame-400/10 px-2 py-0.5 rounded-full">
                Suggested Wish
              </span>
              <span className="text-[10px] text-ivory-300/50 font-mono">#{previewWish.id}</span>
            </div>
            <p className="text-sm text-ivory-100 italic font-serif">&ldquo;{previewWish.text}&rdquo;</p>
          </div>
          <button
            type="button"
            onClick={() => onPreviewWishChange(null)}
            className="text-ivory-300/60 hover:text-ivory-100 text-xs px-2 py-1 rounded min-h-[32px] cursor-pointer"
            title="Clear preview"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
