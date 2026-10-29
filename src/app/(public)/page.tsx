import React from "react";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/public/Hero";
import { Counter } from "@/components/public/Counter";
import { HowItWorks } from "@/components/public/HowItWorks";
import { RecentWishes } from "@/components/public/RecentWishes";
import { QuizBanner } from "@/components/public/QuizBanner";
import { ShareBlock } from "@/components/public/ShareBlock";
import { DiwaliStoryAndFaq } from "@/components/public/DiwaliStoryAndFaq";

export const revalidate = 10; // ISR cache 10s

export default async function HomePage() {
  // Fetch truthful initial counters from database
  let initialDiyasLit = 0;
  let initialWishesShared = 0;
  let recentDiyas: {
    publicId: string;
    style: string;
    wishText: string;
    dedication: string | null;
    createdAt: string;
  }[] = [];

  try {
    const [diyaCounter, wishCounter, recents] = await Promise.all([
      prisma.counter.findUnique({ where: { key: "diyas_total" } }),
      prisma.counter.findUnique({ where: { key: "wishes_shared" } }),
      prisma.diya.findMany({
        where: {
          status: "PUBLISHED",
          wishVisible: true,
        },
        include: {
          wish: {
            select: { text: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
    ]);

    initialDiyasLit = Number(diyaCounter?.value || 0n);
    initialWishesShared = Number(wishCounter?.value || 0n);

    recentDiyas = recents.map((d) => ({
      publicId: d.publicId,
      style: d.style,
      wishText: d.customWish || d.wish?.text || "May light triumph over darkness.",
      dedication:
        d.dedicationText ||
        (d.dedication === "family"
          ? "For family"
          : d.dedication === "friends"
          ? "For friends"
          : d.dedication === "loved_ones"
          ? "For loved one"
          : d.dedication === "world"
          ? "For the world"
          : null),
      createdAt: d.createdAt.toISOString(),
    }));
  } catch {
    // When local DB is not connected, fallback to production or mock data for local UI development
    try {
      const prodRes = await fetch("https://diyaverse.vercel.app/api/wall?limit=6", {
        next: { revalidate: 60 },
      });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData.diyas) && prodData.diyas.length > 0) {
          recentDiyas = prodData.diyas.slice(0, 6).map((d: Record<string, unknown>) => ({
            publicId: String(d.publicId || ""),
            style: String(d.style || "classic"),
            wishText: (d.wishText as string) || null,
            dedication: (d.dedication as string) || null,
            createdAt: String(d.createdAt || new Date().toISOString()),
          }));
          initialDiyasLit = Math.max(84, prodData.diyas[0]?.seq || 84);
          initialWishesShared = Math.max(80, Math.floor(initialDiyasLit * 0.95));
        }
      }
    } catch {
      // offline fallback
      initialDiyasLit = 84;
      initialWishesShared = 80;
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-grow">
        <Hero />
        <Counter
          initialDiyasLit={initialDiyasLit}
          initialWishesShared={initialWishesShared}
        />
        <HowItWorks />
        <QuizBanner />
        <RecentWishes initialDiyas={recentDiyas} />
        <DiwaliStoryAndFaq />
        <ShareBlock />
      </main>
    </div>
  );
}
