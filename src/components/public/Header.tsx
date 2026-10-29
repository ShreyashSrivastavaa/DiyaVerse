"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DiyaVerseLogo } from "./DiyaVerseLogo";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleOpenMusic = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("diyaverse-open-jukebox"));
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-night-950/90 backdrop-blur-md border-b border-night-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline + ZenithDistrict Product Attribution */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-95 focus-visible:outline-flame-400 py-1 min-h-[44px]"
            aria-label="DiyaVerse Home"
          >
            <DiyaVerseLogo size="sm" />
          </Link>
          <a
            href="https://zenithdistrict.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="A Product of ZenithDistrict"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-night-900/90 border border-flame-400/30 text-[11px] font-medium text-ivory-300 hover:text-flame-300 hover:border-flame-400 transition-colors shadow-sm"
          >
            <span className="text-[10px] text-ivory-400">by</span>
            <span className="font-semibold text-flame-400">ZenithDistrict</span>
            <span className="text-[9px] text-flame-400/80">↗</span>
          </a>
        </div>

        {/* Desktop Navigation (>= md) */}
        <nav aria-label="Main Navigation" className="hidden md:block">
          <ul className="flex items-center gap-2 lg:gap-3">
            <li>
              <Link
                href="/wall"
                className={`inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === "/wall"
                    ? "text-flame-400 bg-night-900 font-semibold"
                    : "text-ivory-300 hover:text-ivory-50 hover:bg-night-900"
                }`}
              >
                Diya Wall
              </Link>
            </li>
            <li>
              <Link
                href="/quiz"
                className={`inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg transition-colors gap-1.5 ${
                  pathname === "/quiz"
                    ? "text-flame-300 bg-night-900 font-semibold"
                    : "text-flame-300/90 hover:text-flame-200 hover:bg-night-900"
                }`}
              >
                <span>🏹</span>
                <span>Quiz</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleOpenMusic}
                title="Festive Music Player"
                aria-label="Open festive music player"
                className="inline-flex items-center justify-center min-h-[44px] px-2.5 py-2 text-sm font-medium text-ivory-300 hover:text-flame-300 hover:bg-night-900 rounded-lg transition-colors gap-1 cursor-pointer"
              >
                <span>🎵</span>
                <span className="text-xs">Music</span>
              </button>
            </li>
            <li>
              <Link
                href="/light"
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold text-night-950 bg-flame-400 hover:bg-flame-300 rounded-xl shadow-md shadow-flame-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Light a Diya 🪔
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Header Right: Compact CTA + Hamburger Menu (< md) */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/light"
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-1.5 text-xs font-bold text-night-950 bg-flame-400 hover:bg-flame-300 rounded-xl shadow-sm transition-transform active:scale-95"
          >
            Light a Diya
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open navigation menu"}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-night-900 border border-night-800 text-ivory-200 hover:text-flame-400 transition-colors focus-visible:ring-2 focus-visible:ring-flame-400 cursor-pointer"
          >
            {mobileOpen ? (
              <span className="text-xl font-bold leading-none">✕</span>
            ) : (
              <span className="text-xl font-bold leading-none">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu Dropdown (< md) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-night-950/80 backdrop-blur-md md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-full bg-[#140206] border-b border-night-800 px-5 py-6 space-y-4 shadow-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav aria-label="Mobile Navigation">
              <ul className="flex flex-col space-y-1">
                <li>
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-colors ${
                      pathname === "/"
                        ? "text-flame-400 bg-night-900/90 font-semibold"
                        : "text-ivory-200 hover:bg-night-900/60"
                    }`}
                  >
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wall"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-colors ${
                      pathname === "/wall"
                        ? "text-flame-400 bg-night-900/90 font-semibold"
                        : "text-ivory-200 hover:bg-night-900/60"
                    }`}
                  >
                    🪔 Diya Wall (Map of India)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/quiz"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-colors ${
                      pathname === "/quiz"
                        ? "text-flame-400 bg-night-900/90 font-semibold"
                        : "text-ivory-200 hover:bg-night-900/60"
                    }`}
                  >
                    🏹 Ramayana Quiz
                  </Link>
                </li>
                <li>
                  <a
                    href="https://zenithdistrict.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between min-h-[48px] px-4 rounded-xl text-base font-medium text-ivory-200 hover:bg-night-900/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>🏢</span>
                      <span>By ZenithDistrict</span>
                    </span>
                    <span className="text-xs text-flame-400 font-mono">zenithdistrict.com ↗</span>
                  </a>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-colors ${
                      pathname === "/about"
                        ? "text-flame-400 bg-night-900/90 font-semibold"
                        : "text-ivory-200 hover:bg-night-900/60"
                    }`}
                  >
                    📖 About DiyaVerse
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenMusic}
                    className="w-full flex items-center justify-between min-h-[48px] px-4 rounded-xl text-base font-medium text-flame-300 hover:bg-night-900/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>🎵</span>
                      <span>Festive Music Player</span>
                    </span>
                    <span className="text-xs bg-flame-400/20 text-flame-300 px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="pt-2">
              <Link
                href="/light"
                onClick={() => setMobileOpen(false)}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-base text-night-950 bg-flame-400 hover:bg-flame-300 shadow-lg shadow-flame-400/30 transition-all active:scale-95"
              >
                <span>Light a Diya Now</span>
                <span>🪔</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
