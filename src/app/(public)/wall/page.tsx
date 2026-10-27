"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { WallCanvas, WallDiya } from "@/components/public/WallCanvas";
import { WallSheet } from "@/components/public/WallSheet";
import { WallList } from "@/components/public/WallList";
import { ActivityStrip } from "@/components/public/ActivityStrip";
import { trackEvent } from "@/lib/analytics/client";

function WallContent() {
  const searchParams = useSearchParams();
  const focusedPublicId = searchParams.get("focus");

  const [diyas, setDiyas] = useState<WallDiya[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"canvas" | "list">("canvas");
  const [selectedDiya, setSelectedDiya] = useState<WallDiya | null>(null);
  const [activeFocusId, setActiveFocusId] = useState<string | null>(focusedPublicId);

  useEffect(() => {
    if (focusedPublicId) {
      setActiveFocusId(focusedPublicId);
    }
  }, [focusedPublicId]);

  // Filters
  const [language, setLanguage] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const fetchDiyas = useCallback(
    async (isInitial = true, cursorParam?: string | null) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: "500",
          language,
          category,
        });

        if (cursorParam) {
          params.set("cursor", cursorParam);
        }

        const res = await fetch(`/api/wall?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.diyas)) {
            setDiyas((prev) => {
              if (isInitial) return data.diyas;
              // Append and cap at ~5000 in-memory
              const combined = [...prev, ...data.diyas];
              return combined.slice(-5000);
            });
            setNextCursor(data.nextCursor || null);
          }
        }
      } catch (err) {
        console.error("Failed to load wall diyas:", err);
      } finally {
        setLoading(false);
      }
    },
    [language, category]
  );

  useEffect(() => {
    trackEvent("wall_opened", {}, language !== "all" ? language : undefined);
    fetchDiyas(true);
  }, [fetchDiyas, language]);

  const handleFilterLanguageChange = (lang: string) => {
    trackEvent("wall_filter_changed", { filterType: "language", value: lang });
    setLanguage(lang);
  };

  const handleFilterCategoryChange = (cat: string) => {
    trackEvent("wall_filter_changed", { filterType: "category", value: cat });
    setCategory(cat);
  };

  const handleSelectDiya = (diya: WallDiya) => {
    trackEvent("diya_opened", { source: "wall", publicId: diya.publicId });
    setActiveFocusId(diya.publicId);
    setSelectedDiya(diya);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Wall Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-night-800 pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-flame-400">
            Collective Light • अखंड दीप
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 mt-1">
            The Diya Wall
          </h1>
          <p className="text-xs sm:text-sm text-ivory-300/80 mt-1">
            Every point of light represents a real diya lit somewhere in the country.
          </p>
        </div>

        {/* View mode toggle & Filter selections */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View toggle */}
          <div className="bg-night-900 border border-night-800 rounded-xl p-1 flex items-center">
            <button
              type="button"
              onClick={() => setViewMode("canvas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[36px] ${
                viewMode === "canvas"
                  ? "bg-flame-400 text-night-950 font-semibold"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              Canvas View 🌌
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[36px] ${
                viewMode === "list"
                  ? "bg-flame-400 text-night-950 font-semibold"
                  : "text-ivory-300 hover:text-ivory-100"
              }`}
            >
              List View 📜
            </button>
          </div>

          {/* Language filter */}
          <select
            value={language}
            onChange={(e) => handleFilterLanguageChange(e.target.value)}
            className="px-3 py-2 bg-night-900 border border-night-800 rounded-xl text-xs text-ivory-100 outline-none focus:ring-1 focus:ring-flame-400 min-h-[40px] cursor-pointer"
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="hinglish">Hinglish</option>
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => handleFilterCategoryChange(e.target.value)}
            className="px-3 py-2 bg-night-900 border border-night-800 rounded-xl text-xs text-ivory-100 outline-none focus:ring-1 focus:ring-flame-400 min-h-[40px] cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="happiness">Happiness & Positivity</option>
            <option value="family">Family & Togetherness</option>
            <option value="love">Love & Relationships</option>
            <option value="health">Health & Peace</option>
            <option value="success">Success & Prosperity</option>
            <option value="friendship">Friendship & Gratitude</option>
            <option value="hope">Hope & New Beginnings</option>
            <option value="universal">Universal Blessings</option>
            <option value="funny">Funny & Lighthearted</option>
          </select>
        </div>
      </div>

      {/* Recent Activity Strip */}
      <ActivityStrip onSelectDiya={handleSelectDiya} />

      {/* Primary Wall Renderers */}
      {viewMode === "canvas" ? (
        <div aria-hidden={viewMode !== "canvas"}>
          <WallCanvas
            diyas={diyas}
            focusedPublicId={activeFocusId}
            onSelectDiya={handleSelectDiya}
            activeLanguage={language}
          />
        </div>
      ) : (
        <WallList
          diyas={diyas}
          onSelectDiya={handleSelectDiya}
          onLoadMore={() => fetchDiyas(false, nextCursor)}
          hasMore={Boolean(nextCursor)}
          loading={loading}
        />
      )}

      {/* Diya Detail Bottom Sheet */}
      <WallSheet
        diya={selectedDiya}
        onClose={() => setSelectedDiya(null)}
      />
    </div>
  );
}

export default function WallPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-ivory-300">
          Loading nationwide wall of lights...
        </div>
      }
    >
      <WallContent />
    </Suspense>
  );
}
