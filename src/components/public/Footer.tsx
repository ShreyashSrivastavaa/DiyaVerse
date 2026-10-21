import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-night-900 bg-night-950/80 backdrop-blur text-ivory-300 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-serif font-bold text-flame-400 hover:text-flame-300 transition-colors"
          >
            <span aria-hidden="true">🪔</span> DiyaVerse
          </Link>
          <p className="text-xs text-ivory-300/80 max-w-sm">
            This Diwali, Let&apos;s Light India Together. Every diya is a real saved light on our
            nationwide wall.
          </p>
        </div>

        <nav aria-label="Footer Navigation">
          <ul className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <li>
              <Link
                href="/about"
                className="hover:text-flame-400 transition-colors p-2 inline-block min-h-[44px] leading-[28px]"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-flame-400 transition-colors p-2 inline-block min-h-[44px] leading-[28px]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="hover:text-flame-400 transition-colors p-2 inline-block min-h-[44px] leading-[28px]"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-flame-400 transition-colors p-2 inline-block min-h-[44px] leading-[28px]"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/wall"
                className="text-flame-400 hover:text-flame-300 transition-colors p-2 inline-block min-h-[44px] leading-[28px]"
              >
                Diya Wall
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-night-900 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-300/60 gap-4">
        <p>© {new Date().getFullYear()} DiyaVerse. All rights reserved.</p>
        <p className="text-center sm:text-right">
          Zero fabricated data • No signup required • Truthful collective light
        </p>
      </div>
    </footer>
  );
}
