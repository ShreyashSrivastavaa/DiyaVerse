"use client";

import React from "react";
import Link from "next/link";
import { DiyaVerseLogo } from "./DiyaVerseLogo";

export function Footer() {
  const handleOpenMusic = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("diyaverse-open-jukebox"));
    }
  };

  return (
    <footer className="w-full border-t border-night-900 bg-night-950/80 backdrop-blur text-ivory-300 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] px-4 sm:px-6 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90 min-h-[44px]"
            aria-label="DiyaVerse Home"
          >
            <DiyaVerseLogo size="md" />
          </Link>
          <p className="text-xs sm:text-sm text-ivory-300/80 max-w-sm">
            This Diwali, Let&apos;s Light India Together. Every diya is a real saved light on our
            nationwide wall.
          </p>
        </div>

        <nav aria-label="Footer Navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
            <li>
              <Link
                href="/about"
                className="hover:text-flame-400 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-flame-400 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-flame-400 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-flame-400 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/quiz"
                className="hover:text-flame-400 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                Ramayana Quiz
              </Link>
            </li>
            <li>
              <Link
                href="/wall"
                className="text-flame-400 hover:text-flame-300 transition-colors p-2 inline-flex items-center min-h-[44px]"
              >
                Diya Wall
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleOpenMusic}
                title="Open festive music player"
                aria-label="Open festive music player"
                className="text-flame-300 hover:text-flame-200 transition-colors p-2 inline-flex items-center gap-1 min-h-[44px] cursor-pointer"
              >
                <span>🎵</span>
                <span>Festive Music</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-night-900 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-ivory-300/60 gap-4">
        <p>
          © {new Date().getFullYear()} DiyaVerse • A Product of{" "}
          <a
            href="https://zenithdistrict.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame-400 font-semibold hover:underline min-h-[44px] inline-flex items-center"
          >
            ZenithDistrict
          </a>
        </p>
        <p className="text-center sm:text-right">
          Inquiries:{" "}
          <a
            href="mailto:zenithdistrict14@gmail.com"
            className="text-flame-400/80 hover:text-flame-300 underline min-h-[44px] inline-flex items-center"
          >
            zenithdistrict14@gmail.com
          </a>{" "}
          • Zero fabricated data
        </p>
      </div>
    </footer>
  );
}
