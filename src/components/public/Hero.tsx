"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics/client";

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 text-center flex flex-col items-center justify-center">
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
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-flame-400/10 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 flex flex-col items-center">
        {/* Festive Hero Artwork with Warm Glow */}
        <div className="mb-8 relative flex items-center justify-center w-full max-w-xl sm:max-w-2xl group">
          <div
            className="absolute -inset-3 bg-flame-400/20 rounded-3xl blur-2xl group-hover:bg-flame-400/30 transition-all duration-700 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-flame-400/30 shadow-[0_0_35px_rgba(255,159,28,0.25)] bg-night-950/40">
            <Image
              src="/hero-diwali.jpg"
              alt="Shubh Deepavali - Lord Rama, Sita, and Lakshmana in Ayodhya with illuminated diyas"
              width={1024}
              height={576}
              priority
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        {/* H1 Heading */}
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-ivory-50 tracking-tight leading-tight sm:leading-none mb-6">
          This Diwali, Let&apos;s Light India Together.
        </h1>

        {/* One-sentence explainer */}
        <p className="text-base sm:text-xl text-ivory-300 max-w-xl mx-auto leading-relaxed mb-8">
          Light a virtual diya in under ten seconds, attach a heartfelt wish, and join a truthful, glowing nationwide wall of lights.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/light"
            onClick={() => trackEvent("cta_light_clicked", { location: "hero" })}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base text-night-950 bg-flame-400 hover:bg-flame-300 transition-all duration-200 shadow-[0_0_25px_rgba(255,159,28,0.4)] hover:shadow-[0_0_35px_rgba(255,159,28,0.6)] min-h-[52px] flex items-center justify-center gap-2 cursor-pointer outline-none focus:ring-2 focus:ring-flame-400"
          >
            <span>Light a Diya 🪔</span>
            <span className="text-xs font-hindi opacity-80">(दीया जलाएं)</span>
          </Link>

          <Link
            href="/wall"
            className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-base text-ivory-100 bg-night-900/80 hover:bg-night-850 border border-night-750 hover:border-night-700 transition-all duration-200 min-h-[52px] flex items-center justify-center gap-2 cursor-pointer outline-none focus:ring-2 focus:ring-flame-400"
          >
            <span>Explore the Diya Wall</span>
            <span className="text-flame-400">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
