import React from "react";
import Link from "next/link";

export const QuizBanner: React.FC = () => {
  return (
    <section className="py-12 max-w-5xl mx-auto px-4">
      <div className="relative rounded-3xl bg-gradient-to-r from-night-900 via-plum-700/40 to-night-900 border border-flame-400/30 p-8 sm:p-10 shadow-[0_0_35px_rgba(255,159,28,0.12)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Ambient warm glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-flame-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flame-400/10 border border-flame-400/25 text-xs text-flame-300 font-semibold tracking-wide uppercase">
            <span>🏹</span>
            <span>New Festive Feature / विशेष प्रश्नोत्तरी</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-wide">
            Test Your Ramayana Knowledge
          </h2>

          <p className="text-sm text-ivory-200/90 leading-relaxed">
            From Bala Kanda to Yuddha Kanda, test your mastery across 10 curated questions (3 Easy, 3 Medium, 4 Hard). Discover fascinating sacred lore and get your score out of 10!
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-flame-300/80 font-mono">
            <span>✨ 10 MCQs</span>
            <span>•</span>
            <span>🎯 Instant Explanations</span>
            <span>•</span>
            <span>🏆 Score out of 10</span>
          </div>
        </div>

        <div className="z-10 shrink-0 flex flex-col items-center gap-3">
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-xl font-semibold text-sm text-night-950 bg-gradient-to-r from-flame-500 via-amber-400 to-flame-400 hover:from-flame-400 hover:to-amber-300 shadow-lg shadow-flame-500/30 transition-all hover:scale-[1.03] active:scale-[0.98] text-center"
          >
            <span>Play Ramayana Quiz →</span>
          </Link>
          <span className="text-[11px] text-ivory-300/60 font-hindi">
            रामायण क्विज़ खेलें • निःशुल्क
          </span>
        </div>
      </div>
    </section>
  );
};
