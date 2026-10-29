import React from "react";
import Link from "next/link";
import { DiyaVerseLogo } from "./DiyaVerseLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-night-950/80 backdrop-blur-md border-b border-night-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-95 focus-visible:outline-flame-400 py-1 min-h-[44px]"
          aria-label="DiyaVerse Home"
        >
          <DiyaVerseLogo size="sm" />
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="flex items-center gap-2 sm:gap-4">
            <li>
              <Link
                href="/wall"
                className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-ivory-300 hover:text-ivory-50 hover:bg-night-900 rounded-lg transition-colors"
              >
                Diya Wall
              </Link>
            </li>
            <li>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-flame-300 hover:text-flame-200 hover:bg-night-900 rounded-lg transition-colors gap-1.5"
              >
                <span>🏹</span>
                <span>Quiz</span>
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-sm font-medium text-ivory-300 hover:text-ivory-50 hover:bg-night-900 rounded-lg transition-colors"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/light"
                className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm font-semibold text-night-950 bg-flame-500 hover:bg-flame-400 rounded-lg shadow-md shadow-flame-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Light a Diya
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
