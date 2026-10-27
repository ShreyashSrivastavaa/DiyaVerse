import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DiyaSprite, DiyaStyle } from "@/components/public/DiyaSprite";
import { DiyaActions } from "@/components/public/DiyaActions";

interface DiyaPageProps {
  params: Promise<{ id: string }>;
}

async function getDiya(id: string) {
  try {
    const diya = await prisma.diya.findUnique({
      where: { publicId: id },
      include: { wish: true },
    });
    if (diya) return diya;
  } catch {
    // If local DB is not connected, fallback
  }

  // Try production API
  try {
    const res = await fetch(`https://diyaverse.vercel.app/api/diyas/${id}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.publicId,
        publicId: data.publicId,
        style: data.style,
        status: data.status || "PUBLISHED",
        wishVisible: !data.wish?.hidden,
        customWish: data.wish?.text || "",
        wish: null,
        dedication: data.dedication || null,
        dedicationText: data.dedicationText || null,
        locale: data.locale || "en",
        createdAt: new Date(data.createdAt || Date.now()),
      };
    }
  } catch {
    // ignore
  }

  // Try local mock-wall.json
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const mockPath = path.resolve(process.cwd(), "data/mock-wall.json");
    if (fs.existsSync(mockPath)) {
      const raw = fs.readFileSync(mockPath, "utf-8");
      const parsed = JSON.parse(raw);
      const found = parsed.diyas?.find((d: any) => d.publicId === id);
      if (found) {
        return {
          id: found.publicId,
          publicId: found.publicId,
          style: found.style,
          status: "PUBLISHED",
          wishVisible: true,
          customWish: found.wishText,
          wish: null,
          dedication: found.dedication,
          dedicationText: null,
          locale: found.locale || "en",
          createdAt: new Date(found.createdAt || Date.now()),
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function generateMetadata({ params }: DiyaPageProps): Promise<Metadata> {
  const { id } = await params;
  const diya = await getDiya(id);

  if (!diya || diya.status === "DELETED" || !diya.wishVisible) {
    return {
      title: "DiyaVerse • A Sacred Light for Diwali",
      description: "A diya lit with warm blessings on DiyaVerse.",
    };
  }

  const wishText = diya.customWish || diya.wish?.text || "May light triumph over darkness.";
  const dedication = diya.dedicationText || (diya.dedication ? `For my ${diya.dedication}` : "");
  const title = dedication ? `Diya ${dedication} • DiyaVerse` : "A Sacred Diya • DiyaVerse";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.in";
  const ogImageUrl = `${siteUrl}/d/${id}/opengraph-image`;

  return {
    title,
    description: `"${wishText}" — Lit on DiyaVerse this Diwali.`,
    alternates: {
      canonical: `${siteUrl}/d/${id}`,
    },
    openGraph: {
      title,
      description: `"${wishText}" — Lit on DiyaVerse this Diwali.`,
      url: `${siteUrl}/d/${id}`,
      siteName: "DiyaVerse",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "DiyaVerse Sacred Diya Greeting Card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `"${wishText}" — Lit on DiyaVerse this Diwali.`,
      images: [ogImageUrl],
    },
  };
}

export default async function DiyaPage({ params }: DiyaPageProps) {
  const { id } = await params;
  const diya = await getDiya(id);

  // Not found or deleted state
  if (!diya || diya.status === "DELETED") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-8 max-w-md bg-night-900/60 border border-night-800 rounded-3xl space-y-4 shadow-xl">
          <span className="text-4xl block">🪔</span>
          <h1 className="text-2xl font-serif text-ivory-50">This diya is resting</h1>
          <p className="text-sm text-ivory-300/80 leading-relaxed">
            This light has been respectfully retired or moved. You can kindle a fresh light of your own for this Diwali.
          </p>
          <div className="pt-2">
            <Link
              href="/light"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-night-950 bg-flame-400 hover:bg-flame-300 transition-all shadow-[0_0_15px_rgba(255,159,28,0.3)] min-h-[44px]"
            >
              Light a Diya Now 🪔
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVisible = diya.wishVisible && diya.status !== "HIDDEN";
  const wishText = isVisible
    ? diya.customWish || diya.wish?.text || "May this sacred light bring abundance and joy to your life."
    : "A quiet diya glowing silently for peace.";

  const resolvedDedication =
    isVisible &&
    (diya.dedicationText ||
      (diya.dedication === "family"
        ? "For my family"
        : diya.dedication === "friends"
        ? "For my friends"
        : diya.dedication === "loved_ones"
        ? "For someone I love"
        : diya.dedication === "world"
        ? "For the world"
        : null));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center">
      <div className="w-full space-y-8 animate-fade-in">
        {/* Main Lit Diya Card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-night-900 to-night-950 border border-flame-400/30 p-8 sm:p-10 text-center shadow-[0_0_40px_rgba(255,159,28,0.18)] flex flex-col items-center">
          {/* Subtle radiant background glow */}
          <div className="absolute top-1/4 w-56 h-56 bg-flame-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Diya Sprite */}
          <div className="mb-6">
            <DiyaSprite style={diya.style as DiyaStyle} size="hero" isLit={true} />
          </div>

          {/* Dedication Tag */}
          {resolvedDedication && (
            <span className="inline-block px-3.5 py-1 rounded-full bg-flame-400/10 border border-flame-400/25 text-xs text-flame-300 font-medium tracking-wider uppercase mb-4">
              {resolvedDedication}
            </span>
          )}

          {/* Sacred Wish Text */}
          <blockquote className="text-xl sm:text-2xl font-serif text-ivory-50 italic max-w-lg leading-relaxed mb-4">
            &ldquo;{wishText}&rdquo;
          </blockquote>

          {/* Diya metadata footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-ivory-300/60 font-mono mt-2">
            <span>Diya #{diya.publicId}</span>
            <span>•</span>
            <span>
              {new Date(diya.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Client Interactive Actions */}
        <DiyaActions publicId={diya.publicId} wishText={wishText} />

        {/* Link back to Collective Wall */}
        <div className="text-center pt-4">
          <Link
            href={`/wall?focus=${diya.publicId}`}
            className="text-xs text-flame-400/80 hover:text-flame-300 underline transition-colors"
          >
            ← View this light on the Collective Wall
          </Link>
        </div>
      </div>
    </div>
  );
}
