"use client";

import React, { useState } from "react";
import { copyToClipboard, getWhatsAppShareUrl, triggerNativeShare } from "@/lib/share";
import { trackEvent } from "@/lib/analytics/client";

export const ShareBlock: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const siteUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://diyaverse.in";

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
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-night-900 to-night-950 border border-flame-400/25 relative overflow-hidden shadow-[0_0_30px_rgba(255,159,28,0.1)]">
        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <span className="text-3xl">🪔</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory-50">
            Invite Your Friends & Family to Light a Diya
          </h2>
          <p className="text-sm text-ivory-300 leading-relaxed font-hindi">
            अपनों को जोड़ें और इस दिवाली हर घर तक खुशियों का दीया पहुंचाएं
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow min-h-[48px] cursor-pointer"
            >
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleNative}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all flex items-center justify-center gap-2 shadow min-h-[48px] cursor-pointer"
            >
              <span>Share DiyaVerse</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm text-ivory-200 bg-night-850 hover:bg-night-800 border border-night-700 transition-colors flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
