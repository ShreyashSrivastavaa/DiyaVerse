"use client";

import React, { useState } from "react";
import { copyToClipboard, getWhatsAppShareUrl, triggerNativeShare } from "@/lib/share";
import { trackEvent } from "@/lib/analytics/client";

export const ShareBlock: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== "undefined"
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app");

  const shareText = "This Diwali, let's illuminate India together on DiyaVerse 🪔 Light a virtual diya in seconds and join the collective glowing wall:";

  const handleWhatsApp = () => {
    trackEvent("share_whatsapp_initiated", { context: "site_share" });
    const url = getWhatsAppShareUrl(shareText, siteUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNative = async () => {
    trackEvent("share_menu_opened", { context: "site_share" });
    const res = await triggerNativeShare({
      title: "DiyaVerse • Light India Together",
      text: shareText,
      url: siteUrl,
    });
    if (res === "completed") {
      trackEvent("share_native_completed", { context: "site_share" });
    }
  };

  const handleCopy = async () => {
    trackEvent("link_copied", { context: "site_share" });
    const ok = await copyToClipboard(siteUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-14 px-4 max-w-4xl mx-auto text-center">
      {/* Festive Bulb Marquee Frame Box */}
      <div className="relative w-full rounded-[34px] sm:rounded-[38px] shadow-[0_0_50px_rgba(255,159,28,0.25)] sm:aspect-[2.73/1] flex items-center justify-center">
        {/* Bulb Marquee Background Frame */}
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-[length:100%_100%] pointer-events-none rounded-[34px] sm:rounded-[38px]"
          style={{ backgroundImage: "url('/marquee-frame.png')" }}
          aria-hidden="true"
        />

        {/* Soft Warm Bulb Ambient Glow */}
        <div
          className="absolute -inset-1 rounded-[38px] bg-flame-400/10 blur-xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Content Container: Positioned inside the glowing bulb border */}
        <div className="relative z-10 w-full px-6 py-9 sm:px-12 sm:py-8 md:px-14 md:py-9">
          <div className="max-w-xl mx-auto space-y-3 sm:space-y-3.5">
            <span className="text-3xl block">🪔</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50 tracking-wide drop-shadow-md">
              Invite Your Friends & Family to Light a Diya
            </h2>
            <p className="text-sm text-ivory-200/90 leading-relaxed font-hindi">
              अपनों को जोड़ें और इस दिवाली हर घर तक खुशियों का दीया पहुंचाएं
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-lg min-h-[46px] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Share on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleNative}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all flex items-center justify-center gap-2 shadow-lg min-h-[46px] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Share DiyaVerse</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm text-ivory-200 bg-night-850/80 hover:bg-night-800 border border-flame-400/25 transition-colors flex items-center justify-center gap-2 min-h-[46px] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
