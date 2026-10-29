import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { prisma } from "@/lib/db";
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
      const found = (parsed.diyas as Record<string, unknown>[] | undefined)?.find(
        (d) => d.publicId === id
      );
      if (found) {
        return {
          id: String(found.publicId || id),
          publicId: String(found.publicId || id),
          style: String(found.style || "classic"),
          status: "PUBLISHED" as const,
          wishVisible: true,
          customWish: (found.wishText as string) || null,
          wish: null,
          dedication: (found.dedication as string) || null,
          dedicationText: null,
          locale: (found.locale as string) || "en",
          createdAt: new Date((found.createdAt as string) || Date.now()),
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";

  if (!diya || diya.status === "DELETED" || !diya.wishVisible) {
    return {
      title: "Diya Resting | DiyaVerse",
      description: "A diya lit with warm blessings on DiyaVerse.",
      robots: { index: false, follow: true },
    };
  }

  const rawWish = diya.customWish || diya.wish?.text || "May light triumph over darkness.";
  const truncatedWish = rawWish.length > 100 ? `${rawWish.slice(0, 97)}...` : rawWish;
  const dedication = diya.dedicationText || (diya.dedication ? `For my ${diya.dedication}` : "");
  const title = dedication ? `${dedication} • ${truncatedWish}` : truncatedWish;
  const description = `"${truncatedWish}" — Lit on DiyaVerse this Diwali 2026.`;
  const ogImageUrl = `${siteUrl}/d/${id}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/d/${id}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: `${title} | DiyaVerse`,
      description,
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
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | DiyaVerse`,
      description,
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

  const normalizedStyle = (diya.style || "").toLowerCase();
  const diyaImageSrc =
    normalizedStyle === "marigold"
      ? "/diya-marigold.png"
      : normalizedStyle === "rangoli"
      ? "/diya-rangoli.png"
      : normalizedStyle === "golden" || normalizedStyle === "brass"
      ? "/diya-golden.png"
      : normalizedStyle === "lotus"
      ? "/diya-lotus.png"
      : "/diya-niche.png";
  const diyaAlt =
    normalizedStyle === "marigold"
      ? "Sacred Marigold Diya adorned with festive flowers in illuminated temple niche"
      : normalizedStyle === "rangoli"
      ? "Sacred Rangoli Diya adorned with ornate patterns in illuminated temple niche"
      : normalizedStyle === "golden" || normalizedStyle === "brass"
      ? "Sacred Golden Brass Diya in illuminated temple niche"
      : normalizedStyle === "lotus"
      ? "Sacred Lotus Diya in illuminated temple niche"
      : "Sacred Diya in illuminated temple niche";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://diyaverse.vercel.app";
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Diya Wall",
        item: `${siteUrl}/wall`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Diya #${id}`,
        item: `${siteUrl}/d/${id}`,
      },
    ],
  };

  return (
    <>
      <Script
        id="diya-breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <div className="min-h-screen py-12 px-4 sm:px-6 max-w-2xl sm:max-w-[620px] mx-auto flex flex-col items-center">
        <div className="w-full space-y-8 animate-fade-in">
        {/* Main Lit Diya Card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-night-950/95 via-[#140308]/95 to-night-950/95 border border-ivory-100/35 sm:border-ivory-100/40 p-8 sm:p-11 text-center shadow-[0_0_50px_rgba(255,159,28,0.2)] flex flex-col items-center overflow-hidden">
          {/* Subtle radiant background glow */}
          <div className="absolute top-1/4 w-72 h-72 bg-flame-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Diya in Sacred Niche / Alcove */}
          <div className="relative mb-6 sm:mb-7 flex items-center justify-center">
            <div className="absolute inset-0 bg-flame-500/25 rounded-full blur-2xl transform scale-90 pointer-events-none" />
            <Image
              src={diyaImageSrc}
              alt={diyaAlt}
              width={240}
              height={294}
              priority
              className="relative z-10 w-44 sm:w-52 h-auto object-contain drop-shadow-[0_0_30px_rgba(255,165,30,0.35)] transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          {/* Dedication Tag */}
          {resolvedDedication && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-flame-400/10 border border-flame-400/30 text-xs text-flame-300 font-medium tracking-wider uppercase mb-3.5 shadow-sm">
              {resolvedDedication}
            </span>
          )}

          {/* Sacred Wish Text */}
          <blockquote className="text-xl sm:text-2xl font-serif text-ivory-50 italic max-w-lg leading-relaxed mb-4">
            &ldquo;{wishText}&rdquo;
          </blockquote>

          {/* Diya metadata footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-ivory-300/60 font-mono mt-1">
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
    </>
  );
}
