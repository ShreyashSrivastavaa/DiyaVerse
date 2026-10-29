import React from "react";
import Link from "next/link";

export const QuizBanner: React.FC = () => {
  return (
    <section className="py-10 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Festive Bulb Marquee Frame Box */}
      <div className="relative w-full rounded-3xl sm:rounded-[38px] shadow-[0_0_50px_rgba(255,159,28,0.25)] flex items-center justify-center overflow-hidden">
        {/* Bulb Marquee Background Frame */}
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-[length:100%_100%] pointer-events-none rounded-3xl sm:rounded-[38px]"
          style={{ backgroundImage: "url('/marquee-frame.png')" }}
          aria-hidden="true"
        />

        {/* Soft Warm Bulb Ambient Glow */}
        <div
          className="absolute -inset-1 rounded-[38px] bg-flame-400/10 blur-xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Content Container: Positioned inside the glowing bulb border */}
        <div className="relative z-10 w-full px-5 py-7 sm:px-10 sm:py-8 md:px-14 md:py-9 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 text-center md:text-left z-10 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-flame-400/20 border border-flame-400/35 text-xs text-flame-300 font-semibold tracking-wide uppercase">
              <span>🏹</span>
              <span>New Festive Feature / विशेष प्रश्नोत्तरी</span>
            </div>

            <h2 className="text-xl xs:text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-wide drop-shadow-md">
              Test Your Ramayana Knowledge
            </h2>

            <p className="text-base text-ivory-200/90 leading-relaxed">
              From Bala Kanda to Yuddha Kanda, test your mastery across 10 curated questions. Discover sacred lore and get your score out of 10!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-0.5 text-xs text-flame-300/90 font-mono">
              <span>✨ 10 MCQs</span>
              <span>•</span>
              <span>🎯 Instant Explanations</span>
              <span>•</span>
              <span>🏆 Score out of 10</span>
            </div>
          </div>

          <div className="z-10 shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
            <Link
              href="/quiz"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 rounded-xl font-semibold text-base text-night-950 bg-gradient-to-r from-flame-500 via-amber-400 to-flame-400 hover:from-flame-400 hover:to-amber-300 shadow-lg shadow-flame-500/30 transition-all hover:scale-[1.03] active:scale-[0.98] text-center"
            >
              <span>Play Ramayana Quiz →</span>
            </Link>
            <span className="text-[11px] text-ivory-300/70 font-hindi">
              रामायण क्विज़ खेलें • निःशुल्क
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
