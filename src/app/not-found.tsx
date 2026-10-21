import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md p-8 bg-night-900/60 border border-night-800 rounded-3xl space-y-4 shadow-xl">
        <span className="text-4xl block">🪔</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
          Page Not Found
        </h1>
        <p className="text-sm text-ivory-300/80 leading-relaxed font-hindi">
          यह पृष्ठ उपलब्ध नहीं है, परंतु आपके लिए दीये की रोशनी सदा खुली है
        </p>
        <p className="text-xs text-ivory-300/60 leading-relaxed">
          The path you took does not lead to a known flame. You can return home or light a new diya.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-ivory-100 bg-night-800 hover:bg-night-750 border border-night-700 min-h-[44px] flex items-center justify-center"
          >
            Home / मुख्य पृष्ठ
          </Link>
          <Link
            href="/light"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-night-950 bg-flame-400 hover:bg-flame-300 min-h-[44px] flex items-center justify-center shadow"
          >
            Light a Diya 🪔
          </Link>
        </div>
      </div>
    </div>
  );
}
