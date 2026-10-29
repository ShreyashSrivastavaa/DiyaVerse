"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics/client";


export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16 text-center flex flex-col items-center justify-center">
      {/* 12 Floating Embers (pure CSS, hidden under prefers-reduced-motion) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-flame-400 opacity-60 animate-ember motion-reduce:hidden"
            style={{
              width: `${Math.max(2, (i % 4) * 1.5 + 2)}px`,
              height: `${Math.max(2, (i % 4) * 1.5 + 2)}px`,
              left: `${(i * 8.3 + 4) % 100}%`,
              bottom: "-10px",
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${6 + ((i * 1.3) % 4)}s`,
              boxShadow: "0 0 8px #FFC857",
            }}
          />
        ))}
      </div>

      {/* Hero Ambient Radial Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-flame-400/10 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Festive Hero Artwork with Warm Glow */}
        <div className="mb-6 sm:mb-8 relative flex items-center justify-center w-full max-w-2xl sm:max-w-3xl md:max-w-4xl group">
          <div
            className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-flame-500/15 via-flame-400/25 to-flame-500/15 rounded-3xl blur-2xl sm:blur-3xl group-hover:bg-flame-400/35 transition-all duration-700 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-flame-400/30 shadow-[0_0_40px_rgba(255,159,28,0.22)] bg-night-950/40">
            <Image
              src="/hero-diwali.jpg"
              alt="Shubh Deepavali - Lord Rama, Sita, and Lakshmana in Ayodhya with illuminated diyas"
              width={1024}
              height={576}
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
              className="w-full h-auto object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-[1.015]"
            />
          </div>
        </div>

        {/* ZenithDistrict Product Badge */}
        <div className="flex justify-center mb-3">
          <a
            href="https://zenithdistrict.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-night-900/90 border border-flame-400/30 text-xs text-ivory-300 hover:border-flame-400 hover:text-flame-300 transition-all shadow-sm group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-flame-400 animate-pulse" />
            <span className="text-ivory-400 text-[11px]">A Product of</span>
            <span className="font-semibold text-flame-400 text-xs group-hover:underline">ZenithDistrict</span>
            <span className="text-[10px] text-flame-400/80">↗</span>
          </a>
        </div>

        {/* Fluid H1 Heading (never breaks or overflows on 320px) */}
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ivory-50 tracking-tight leading-[1.2] sm:leading-tight mb-4 max-w-3xl break-words">
          This Diwali, Let&apos;s Light India Together.
        </h1>

        {/* One-sentence explainer: at least 16px on mobile */}
        <p className="text-base sm:text-lg text-ivory-200 max-w-xl mx-auto leading-relaxed mb-7 sm:mb-8 px-1">
          Light a virtual diya in under ten seconds, attach a heartfelt wish, and join a truthful, glowing nationwide wall of lights.
        </p>

        {/* Primary and Secondary CTAs: stacked full-width on mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/light"
            onClick={() => trackEvent("cta_light_clicked", { location: "hero" })}
            className="w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base text-night-950 bg-flame-400 hover:bg-flame-300 transition-all duration-200 shadow-[0_0_25px_rgba(255,159,28,0.4)] hover:shadow-[0_0_35px_rgba(255,159,28,0.6)] min-h-[48px] sm:min-h-[52px] flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-flame-400 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Light a Diya 🪔</span>
            <span className="text-xs font-hindi opacity-80">(दीया जलाएं)</span>
          </Link>

          <Link
            href="/wall"
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-semibold text-base text-ivory-100 bg-night-900/80 hover:bg-night-850 border border-night-750 hover:border-night-700 transition-all duration-200 min-h-[48px] sm:min-h-[52px] flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-flame-400 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore the Diya Wall</span>
            <span className="text-flame-400">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
