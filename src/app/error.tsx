"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DiyaVerse error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md p-8 bg-night-900/70 border border-night-800 rounded-3xl space-y-4 shadow-xl">
        <span className="text-4xl block">🕯️</span>
        <h1 className="text-2xl font-serif font-bold text-ivory-50">
          Something went quiet
        </h1>
        <p className="text-sm text-ivory-300/80 leading-relaxed font-hindi">
          एक अनपेक्षित त्रुटि हुई है। कृपया पुनः प्रयास करें।
        </p>
        <p className="text-xs text-ivory-300/60 leading-relaxed">
          The flame flickered due to a temporary issue. You can try refreshing or return to the homepage.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-night-950 bg-flame-400 hover:bg-flame-300 min-h-[44px] flex items-center justify-center cursor-pointer shadow"
          >
            Try Again / पुनः प्रयास करें
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-ivory-100 bg-night-800 hover:bg-night-750 border border-night-700 min-h-[44px] flex items-center justify-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
