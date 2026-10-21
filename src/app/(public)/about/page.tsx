import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DiyaVerse • Our Vision & Principles",
  description: "DiyaVerse is a truthful, nationwide digital celebration connecting hearts across India for Diwali.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-4xl">🪔</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ivory-50 tracking-tight">
          About DiyaVerse
        </h1>
        <p className="text-base sm:text-lg text-ivory-300 font-hindi">
          एक दिया, अनगिनत शुभकामनाएं, एक संयुक्त भारत
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-ivory-200 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-flame-300">Our Vision</h2>
          <p>
            DiyaVerse was conceived as a quiet, sacred digital sanctuary for Diwali. Across millions of homes in India and the diaspora, lighting a diya is an act of hope, gratitude, and dispelling darkness.
          </p>
          <p>
            DiyaVerse enables anyone with a smartphone to kindle a virtual flame in under ten seconds, attach a heartfelt prayer or wish, and join an honest, nationwide constellation of glowing lights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif font-bold text-flame-300">Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-night-900/60 border border-night-800 space-y-2">
              <h3 className="font-semibold text-ivory-50 text-base flex items-center gap-2">
                <span>🛡️</span> Zero Fabrication
              </h3>
              <p className="text-sm text-ivory-300/80">
                Every diya on our wall corresponds to a real person who kindled it. Every counter reconciles directly with row counts in our database. We never seed fake diyas or simulate artificial activity.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-night-900/60 border border-night-800 space-y-2">
              <h3 className="font-semibold text-ivory-50 text-base flex items-center gap-2">
                <span>🔒</span> Privacy First
              </h3>
              <p className="text-sm text-ivory-300/80">
                No signups, no phone numbers, no passwords, and no invasive tracking. We do not store raw IP addresses or sell user data.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-night-900/60 border border-night-800 space-y-2">
              <h3 className="font-semibold text-ivory-50 text-base flex items-center gap-2">
                <span>⚡</span> Built for India
              </h3>
              <p className="text-sm text-ivory-300/80">
                Designed to load smoothly on affordable smartphones and 4G networks. Accessible, lightweight, and culturally authentic in English, Hindi (Devanagari), and Hinglish.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-night-900/60 border border-night-800 space-y-2">
              <h3 className="font-semibold text-ivory-50 text-base flex items-center gap-2">
                <span>🕊️</span> Respectful & Inclusive
              </h3>
              <p className="text-sm text-ivory-300/80">
                Diwali transcends boundaries. DiyaVerse is designed to welcome everyone who wishes to celebrate light, prosperity, and peace.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif font-bold text-flame-300">The 2,000-Wish Library</h2>
          <p>
            For those who prefer not to type their own text, our team has handcrafted and validated a library of exactly 2,000 curated wishes across 10 distinct emotional categories in English, Hindi, and Hinglish. Each wish reflects optimism, harmony, and festive warmth.
          </p>
        </section>
      </div>

      <div className="text-center pt-8 border-t border-night-800">
        <Link
          href="/light"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-[0_0_20px_rgba(255,159,28,0.35)] min-h-[48px]"
        >
          Light a Diya Now 🪔
        </Link>
      </div>
    </div>
  );
}
