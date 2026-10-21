"use client";

import React, { useState, useEffect } from "react";

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("diyaverse_consent");
    if (consent === null) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("diyaverse_consent", "accepted");
    // Generate or ensure visitorId is stored
    if (!localStorage.getItem("diyaverse_visitor_id")) {
      localStorage.setItem("diyaverse_visitor_id", crypto.randomUUID());
    }
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("diyaverse_consent", "declined");
    localStorage.removeItem("diyaverse_visitor_id");
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Privacy and Analytics Notice"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-night-900/95 backdrop-blur-md border-t border-night-800 text-ivory-50 shadow-2xl transition-all duration-300"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-ivory-300 leading-relaxed text-center sm:text-left">
          <p>
            <strong className="text-flame-400 font-medium">Privacy Notice:</strong> We collect
            minimal, anonymous analytics to count diyas and improve performance. No names, phone
            numbers, or precise locations are ever collected.{" "}
            <a href="/privacy" className="underline hover:text-flame-300 transition-colors">
              Learn more in our Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDecline}
            className="min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg text-ivory-300 hover:text-ivory-50 hover:bg-night-800 transition-colors border border-night-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg bg-flame-500 text-night-950 hover:bg-flame-400 transition-colors shadow-md shadow-flame-500/20"
          >
            Accept
          </button>
        </div>
      </div>
    </aside>
  );
}
