"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DiyaSprite, DiyaStyle } from "./DiyaSprite";
import { copyToClipboard, getWhatsAppShareUrl, triggerNativeShare } from "@/lib/share";
import { trackEvent } from "@/lib/analytics/client";

interface SuccessScreenProps {
  publicId: string;
  style: DiyaStyle;
  wishText: string;
  dedication?: string | null;
  dedicationText?: string | null;
  locale: string;
  onLightAnother: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  publicId,
  style,
  wishText,
  dedication,
  dedicationText,
  locale,
  onLightAnother,
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const diyaUrl = typeof window !== "undefined"
    ? `${window.location.origin}/d/${publicId}`
    : `/d/${publicId}`;

  const resolvedDedication =
    dedication === "custom" && dedicationText
      ? dedicationText
      : dedication === "family"
      ? "For my family"
      : dedication === "friends"
      ? "For my friends"
      : dedication === "loved_ones"
      ? "For someone I love"
      : dedication === "world"
      ? "For the world"
      : null;

  const shareText = `I lit a sacred diya on DiyaVerse this Diwali: "${wishText}". Light yours here:`;

  const handleCopyLink = async () => {
    trackEvent("link_copied", { publicId }, locale);
    const ok = await copyToClipboard(diyaUrl);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    trackEvent("share_whatsapp_initiated", { publicId }, locale);
    const url = getWhatsAppShareUrl(shareText, diyaUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    trackEvent("share_menu_opened", { publicId }, locale);
    const result = await triggerNativeShare({
      title: "My Diya on DiyaVerse",
      text: shareText,
      url: diyaUrl,
    });

    if (result === "completed") {
      trackEvent("share_native_completed", { publicId }, locale);
    }
  };

  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      trackEvent("card_downloaded", { publicId }, locale);

      const downloadUrl = `/api/diyas/${publicId}/card.png`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Failed to generate card");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `diyaverse-${publicId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e) {
      console.error("Download card error:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-8 animate-fade-in py-4">
      {/* Lit Diya Card Showcase */}
      <div className="relative rounded-2xl bg-gradient-to-b from-night-900 to-night-950 border border-flame-500/30 p-6 sm:p-8 text-center shadow-[0_0_35px_rgba(255,159,28,0.15)] flex flex-col items-center">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 w-48 h-48 bg-flame-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-4">
          <DiyaSprite style={style} size="lg" isLit={true} />
        </div>

        {resolvedDedication && (
          <span className="inline-block px-3 py-1 rounded-full bg-flame-400/10 border border-flame-400/20 text-xs text-flame-300 font-medium tracking-wide uppercase mb-3">
            {resolvedDedication}
          </span>
        )}

        <blockquote className="text-xl sm:text-2xl font-serif text-ivory-50 italic max-w-md leading-relaxed my-2">
          &ldquo;{wishText}&rdquo;
        </blockquote>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ivory-300/60 font-mono">
          <span>Diya #{publicId}</span>
          <span>•</span>
          <span>Just now</span>
        </div>
      </div>

      {/* Share Actions Section */}
      <div className="bg-night-900/60 border border-night-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-ivory-50">Share Your Light / रोशनी फैलाएं</h3>
          <p className="text-xs text-ivory-300/70 mt-0.5">
            Send this card to your family, friends, and loved ones.
          </p>
        </div>

        {/* Primary share triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl font-medium text-sm text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#25D366]"
          >
            <span className="text-base font-bold">WhatsApp</span>
            <span className="text-xs opacity-90">भेजें</span>
          </button>

          {/* Web Share or Native Share */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl font-medium text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-flame-400"
          >
            <span>Share Diya</span>
            <span className="text-xs font-hindi opacity-90">शेयर करें</span>
          </button>
        </div>

        {/* Secondary share utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-ivory-200 bg-night-850 hover:bg-night-800 border border-night-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer outline-none focus:ring-2 focus:ring-flame-400"
          >
            <span>🔗</span>
            <span>{copyFeedback ? "Link Copied!" : "Copy Link"}</span>
          </button>

          {/* Download Greeting Card Image */}
          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={downloading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-ivory-200 bg-night-850 hover:bg-night-800 border border-night-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 outline-none focus:ring-2 focus:ring-flame-400"
          >
            <span>📥</span>
            <span>{downloading ? "Preparing Card..." : "Download Card (PNG)"}</span>
          </button>
        </div>
      </div>

      {/* Navigation / Next actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link
          href={`/wall?focus=${publicId}`}
          className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-night-850 hover:bg-night-800 border border-night-700 text-sm font-medium text-ivory-100 transition-colors min-h-[44px] flex items-center justify-center gap-2"
        >
          <span>See it on the Wall</span>
          <span className="text-flame-400">→</span>
        </Link>

        <button
          type="button"
          onClick={onLightAnother}
          className="w-full sm:w-auto text-center px-5 py-3 rounded-xl bg-transparent hover:bg-night-900 border border-flame-400/40 text-sm font-medium text-flame-300 transition-colors min-h-[44px] cursor-pointer"
        >
          + Light Another Diya
        </button>
      </div>
    </div>
  );
};
