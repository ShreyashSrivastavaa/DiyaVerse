"use client";

import React, { useState } from "react";
import Link from "next/link";
import { copyToClipboard, getWhatsAppShareUrl, triggerNativeShare } from "@/lib/share";
import { trackEvent } from "@/lib/analytics/client";
import { ReportDialog } from "./ReportDialog";

interface DiyaActionsProps {
  publicId: string;
  wishText: string;
}

export const DiyaActions: React.FC<DiyaActionsProps> = ({ publicId, wishText }) => {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const diyaUrl = typeof window !== "undefined"
    ? `${window.location.origin}/d/${publicId}`
    : `/d/${publicId}`;

  const shareText = `I saw a sacred diya on DiyaVerse: "${wishText}". Light yours here:`;

  const handleCopy = async () => {
    trackEvent("link_copied", { publicId });
    const ok = await copyToClipboard(diyaUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    trackEvent("share_whatsapp_initiated", { publicId });
    const url = getWhatsAppShareUrl(shareText, diyaUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    trackEvent("share_menu_opened", { publicId });
    const res = await triggerNativeShare({
      title: "DiyaVerse Diya",
      text: shareText,
      url: diyaUrl,
    });
    if (res === "completed") {
      trackEvent("share_native_completed", { publicId });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href={`/light?ref=share&src=d_${publicId}`}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-[0_0_20px_rgba(255,159,28,0.35)] flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>Light your own diya 🪔</span>
        </Link>

        <button
          type="button"
          onClick={handleWhatsApp}
          className="w-full sm:w-auto px-5 py-3 rounded-xl font-medium text-sm text-white bg-[#25D366] hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
        >
          <span>WhatsApp Share</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-sm text-ivory-100 bg-night-850 hover:bg-night-800 border border-night-700 transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
        >
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-sm text-ivory-200 bg-night-900 hover:bg-night-850 border border-night-800 transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
        >
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      {/* Report button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="text-xs text-ivory-300/40 hover:text-ivory-300/80 transition-colors underline cursor-pointer"
        >
          Report inappropriate content
        </button>
      </div>

      {/* Report Dialog Modal */}
      {reportOpen && (
        <ReportDialog
          diyaPublicId={publicId}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
};
