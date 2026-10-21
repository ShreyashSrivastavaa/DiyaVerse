"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StylePicker } from "@/components/public/StylePicker";
import { WishField } from "@/components/public/WishField";
import { DedicationChips, DedicationType } from "@/components/public/DedicationChips";
import { LightingAnimation } from "@/components/public/LightingAnimation";
import { SuccessScreen } from "@/components/public/SuccessScreen";
import { DiyaStyle } from "@/components/public/DiyaSprite";
import { trackEvent } from "@/lib/analytics/client";
import { generateUUID } from "@/lib/ids";

type Step = "choose" | "lighting" | "lit" | "error";
type LocaleType = "en" | "hi" | "hinglish";

interface CreatedDiyaData {
  publicId: string;
  style: DiyaStyle;
  wish: {
    text: string;
    language: string;
  };
  dedication?: string | null;
  dedicationText?: string | null;
}

interface CreateDiyaApiResponse {
  publicId?: string;
  style?: DiyaStyle;
  wish?: {
    text: string;
    language: string;
  };
  dedication?: string | null;
  dedicationText?: string | null;
  code?: string;
  error?: string;
}

function LightFlowContent() {
  const searchParams = useSearchParams();

  // Core state
  const [step, setStep] = useState<Step>("choose");
  const [locale, setLocale] = useState<LocaleType>("en");
  const [style, setStyle] = useState<DiyaStyle>("clay");
  const [wishText, setWishText] = useState("");
  const [previewWish, setPreviewWish] = useState<{ id: string; text: string; language: string } | null>(null);
  const [dedication, setDedication] = useState<DedicationType>(null);
  const [dedicationText, setDedicationText] = useState("");

  // Submissions & Keys
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdDiya, setCreatedDiya] = useState<CreatedDiyaData | null>(null);
  const [animationReady, setAnimationReady] = useState(false);

  // Initialize or restore state on mount
  useEffect(() => {
    trackEvent("creator_opened", {}, locale);

    // Generate new idempotencyKey
    setIdempotencyKey(generateUUID());

    // Check if ?d=ID is in URL for refresh persistence
    const existingId = searchParams.get("d");
    if (existingId) {
      fetchExistingDiya(existingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExistingDiya = async (publicId: string) => {
    try {
      const res = await fetch(`/api/diyas/${publicId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.publicId) {
          setCreatedDiya({
            publicId: data.publicId,
            style: data.style as DiyaStyle,
            wish: {
              text: data.wish?.text || "May light triumph over darkness.",
              language: data.locale || "en",
            },
            dedication: data.dedication,
            dedicationText: data.dedicationText,
          });
          setStep("lit");
        }
      }
    } catch (e) {
      console.error("Failed to restore diya from query param:", e);
    }
  };

  const handleLanguageChange = (newLocale: LocaleType) => {
    trackEvent("language_changed", { from: locale, to: newLocale }, newLocale);
    setLocale(newLocale);
    setPreviewWish(null); // Reset preview to match new language pool
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (isSubmitting) return;

    setModerationError(null);
    setServerError(null);
    setIsSubmitting(true);
    setAnimationReady(false);
    trackEvent("diya_submit_attempted", { style, locale }, locale);

    const activeIdempotencyKey = idempotencyKey || generateUUID();
    if (!idempotencyKey) {
      setIdempotencyKey(activeIdempotencyKey);
    }

    try {
      const payload = {
        idempotencyKey: activeIdempotencyKey,
        style,
        wishText: wishText.trim() || undefined,
        previewWishId: previewWish ? previewWish.id : undefined,
        dedication: dedication || undefined,
        dedicationText: dedication === "custom" && dedicationText.trim() ? dedicationText.trim() : undefined,
        locale,
        attribution: {
          refPublicId: searchParams.get("ref") || searchParams.get("refPublicId") || undefined,
          utmSource: searchParams.get("utm_source") || undefined,
          utmCampaign: searchParams.get("utm_campaign") || undefined,
        },
      };

      const res = await fetch("/api/diyas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: CreateDiyaApiResponse = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 422) {
        if (data.code === "WISH_REJECTED" || data.code === "DEDICATION_REJECTED") {
          trackEvent("diya_creation_failed", { reason: "rejected" }, locale);
          setModerationError(data.error || "Please ensure your wish or dedication does not contain contact info or inappropriate words.");
          setIsSubmitting(false);
          setStep("choose");
          return;
        }
      }

      if (res.status === 429) {
        trackEvent("diya_creation_failed", { reason: "rate_limited" }, locale);
        setServerError("You have reached the lighting rate limit. Please pause and try again in a few minutes.");
        setIsSubmitting(false);
        setStep("choose");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Could not connect to the sacred flame. Please tap 'Retry Lighting' below.");
      }

      // Success!
      const result: CreatedDiyaData = {
        publicId: data.publicId || "",
        style: data.style || "clay",
        wish: data.wish || { text: "", language: locale },
        dedication: data.dedication,
        dedicationText: data.dedicationText,
      };

      setCreatedDiya(result);

      // Transition to sacred lighting sequence
      setStep("lighting");

      // Update URL with history.replaceState to /light?d=ID for refresh persistence
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/light?d=${result.publicId}`);
      }

      // If animation finishes or is ready, transition to lit
      setAnimationReady(true);
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      trackEvent("diya_creation_failed", { reason: "server_error" }, locale);
      const errMsg = err instanceof Error ? err.message : null;
      setServerError(errMsg || "Could not connect to the sacred flame. Please tap 'Retry Lighting' below.");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnimationComplete = () => {
    setStep("lit");
  };

  useEffect(() => {
    if (animationReady && createdDiya && step === "lighting") {
      setStep("lit");
    }
  }, [animationReady, createdDiya, step]);

  const handleLightAnother = () => {
    // Generate fresh idempotency key
    setIdempotencyKey(generateUUID());
    setWishText("");
    setPreviewWish(null);
    setDedication(null);
    setDedicationText("");
    setModerationError(null);
    setServerError(null);
    setCreatedDiya(null);
    setStep("choose");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/light");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Step: Choose & Configure */}
      {step === "choose" && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 tracking-tight">
              Light Your Sacred Diya
            </h1>
            <p className="text-sm sm:text-base text-ivory-300 font-hindi">
              अपना पावन दीया जलाएं और देश भर में उजाला फैलाएं
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-center">
            <div className="bg-night-900 border border-night-800 rounded-xl p-1 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                  locale === "en" ? "bg-flame-400 text-night-950 font-semibold" : "text-ivory-300 hover:text-ivory-100"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("hi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] font-hindi ${
                  locale === "hi" ? "bg-flame-400 text-night-950 font-semibold" : "text-ivory-300 hover:text-ivory-100"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("hinglish")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[38px] ${
                  locale === "hinglish" ? "bg-flame-400 text-night-950 font-semibold" : "text-ivory-300 hover:text-ivory-100"
                }`}
              >
                Hinglish
              </button>
            </div>
          </div>

          {/* Inline Moderation Error Banner */}
          {moderationError && (
            <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <span>⚠️</span>
                <span>{moderationError}</span>
              </div>
              <p className="text-xs text-red-300/80">
                Your typed text is preserved. You can edit it or tap below to pick a curated wish:
              </p>
              <button
                type="button"
                onClick={() => {
                  setWishText("");
                  setModerationError(null);
                }}
                className="text-xs text-flame-400 underline font-medium hover:text-flame-300 cursor-pointer"
              >
                Clear text & Surprise Me instead
              </button>
            </div>
          )}

          {/* Server Error Banner */}
          {serverError && (
            <div className="p-4 bg-amber-950/40 border border-flame-500/40 rounded-xl text-flame-200 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Style Picker */}
            <StylePicker
              selected={style}
              onChange={(s) => {
                setStyle(s);
                trackEvent("style_selected", { style: s }, locale);
              }}
              disabled={isSubmitting}
            />

            {/* 2. Wish Input */}
            <WishField
              wishText={wishText}
              onWishTextChange={setWishText}
              previewWish={previewWish}
              onPreviewWishChange={setPreviewWish}
              locale={locale}
              disabled={isSubmitting}
            />

            {/* 3. Dedication Chips */}
            <DedicationChips
              dedication={dedication}
              dedicationText={dedicationText}
              onDedicationChange={setDedication}
              onDedicationTextChange={setDedicationText}
              disabled={isSubmitting}
            />

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] py-3.5 px-6 rounded-xl font-bold text-base text-night-950 bg-flame-400 hover:bg-flame-300 transition-all duration-200 shadow-[0_0_20px_rgba(255,159,28,0.35)] hover:shadow-[0_0_30px_rgba(255,159,28,0.5)] cursor-pointer outline-none focus:ring-2 focus:ring-flame-400 disabled:opacity-50"
              >
                {isSubmitting ? "Kindling the Flame..." : "Light My Diya / दीया प्रज्वलित करें 🪔"}
              </button>
              <p className="text-center text-xs text-ivory-300/50 mt-2.5">
                No sign-up required. Your diya will be illuminated instantly on the collective wall.
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Step: Lighting Animation in flight */}
      {step === "lighting" && (
        <LightingAnimation
          style={style}
          wishText={createdDiya?.wish.text || previewWish?.text || wishText || "May this Diwali bring infinite peace, joy, and light."}
          dedicationText={dedicationText || dedication}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* Step: Lit & Success Screen */}
      {step === "lit" && createdDiya && (
        <SuccessScreen
          publicId={createdDiya.publicId}
          style={createdDiya.style}
          wishText={createdDiya.wish.text}
          dedication={createdDiya.dedication}
          dedicationText={createdDiya.dedicationText}
          locale={locale}
          onLightAnother={handleLightAnother}
        />
      )}

      {/* Step: Network / Submission Error State */}
      {step === "error" && (
        <div className="text-center py-12 space-y-5 animate-fade-in">
          <div className="text-4xl">🪔</div>
          <h2 className="text-2xl font-serif text-ivory-50">Connection Interrupted</h2>
          <p className="text-sm text-ivory-300 max-w-md mx-auto">
            {serverError || "We could not reach the server. Your wish and diya settings have been preserved."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 rounded-xl bg-flame-400 text-night-950 font-bold text-sm min-h-[44px] cursor-pointer"
            >
              Retry Lighting
            </button>
            <button
              type="button"
              onClick={() => {
                setServerError(null);
                setStep("choose");
              }}
              className="px-6 py-3 rounded-xl bg-night-850 border border-night-700 text-ivory-200 text-sm min-h-[44px] cursor-pointer"
            >
              Edit Diya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LightPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ivory-300">Loading sacred creator...</div>}>
      <LightFlowContent />
    </Suspense>
  );
}
