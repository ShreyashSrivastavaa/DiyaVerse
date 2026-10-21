import React from "react";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/public/Hero";
import { Counter } from "@/components/public/Counter";
import { HowItWorks } from "@/components/public/HowItWorks";
import { RecentWishes } from "@/components/public/RecentWishes";
import { ShareBlock } from "@/components/public/ShareBlock";

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
  } catch (err) {
    console.error("Failed to fetch initial home data:", err);
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
        <RecentWishes initialDiyas={recentDiyas} />
        <ShareBlock />
      </main>
    </div>
  );
}
