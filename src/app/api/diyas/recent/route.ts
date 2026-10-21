import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diyas = await prisma.diya.findMany({
      where: {
        status: "PUBLISHED",
        wishVisible: true,
      },
      include: {
        wish: {
          select: {
            text: true,
            language: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });

    const formatted = diyas.map((d) => ({
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

    return NextResponse.json(
      { diyas: formatted },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch recent diyas:", error);
    return NextResponse.json({ diyas: [] }, { status: 500 });
  }
}
