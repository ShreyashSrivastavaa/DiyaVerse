import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
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
}
