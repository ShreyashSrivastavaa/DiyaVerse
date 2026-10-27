import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [diyasTotalCounter, wishesSharedCounter] = await Promise.all([
      prisma.counter.findUnique({ where: { key: "diyas_total" } }),
      prisma.counter.findUnique({ where: { key: "wishes_shared" } }),
    ]);

    const diyasLit = Number(diyasTotalCounter?.value || 0);
    const wishesShared = Number(wishesSharedCounter?.value || 0);
    const updatedAt = diyasTotalCounter?.updatedAt || new Date();

    return NextResponse.json(
      {
        diyasLit,
        wishesShared,
        updatedAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  } catch {
    try {
      const prodRes = await fetch("https://diyaverse.vercel.app/api/stats/public");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        return NextResponse.json(prodData);
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      {
        diyasLit: 84,
        wishesShared: 80,
        updatedAt: new Date(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      },
    );
  }
}
