"use client";

import React, { useState } from "react";
import { trackEvent } from "@/lib/analytics/client";

interface ReportDialogProps {
  diyaPublicId: string;
  onClose: () => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ diyaPublicId, onClose }) => {
  const [reason, setReason] = useState<string>("offensive");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diyaPublicId,
          reason,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      trackEvent("report_submitted", { reason, diyaPublicId });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-night-900 border border-night-750 rounded-2xl p-6 shadow-2xl text-left space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-ivory-50">Report Diya Content</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-ivory-300/60 hover:text-ivory-100 text-lg p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <span className="text-3xl">🕊️</span>
            <p className="text-sm font-medium text-flame-300">
              Thank you for keeping DiyaVerse sacred and safe.
            </p>
            <p className="text-xs text-ivory-300/60">Our moderation team has received your report.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-ivory-300/80">
              If this wish contains hate speech, harassment, phone numbers, or private details, let us know:
            </p>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="report-reason" className="block text-xs font-medium text-ivory-300">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
              >
                <option value="offensive">Offensive, abusive, or inappropriate</option>
                <option value="personal_info">Contains phone number, email, or personal identity</option>
                <option value="spam">Commercial spam or advertising</option>
                <option value="other">Other concern</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="report-note" className="block text-xs font-medium text-ivory-300">
                Additional details (optional, max 200 chars)
              </label>
              <textarea
                id="report-note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Optional explanation..."
                className="w-full px-3 py-2 bg-night-950 border border-night-800 rounded-xl text-sm text-ivory-50 outline-none focus:border-flame-400 focus:ring-1 focus:ring-flame-400 resize-none placeholder-ivory-300/40"
              />
              <span className="block text-right text-[10px] text-ivory-300/50 font-mono">
                {note.length}/200
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-ivory-300 hover:text-ivory-100 min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-night-950 bg-flame-400 hover:bg-flame-300 transition-colors min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
