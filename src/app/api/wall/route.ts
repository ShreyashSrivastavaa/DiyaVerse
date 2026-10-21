import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "500", 10), 500);
    const language = searchParams.get("language");
    const category = searchParams.get("category");

    const where: Prisma.DiyaWhereInput = {
      status: { not: "DELETED" },
    };

    if (language && language !== "all") {
      where.locale = language;
    }

    if (category && category !== "all") {
      where.wish = {
        category,
      };
    }

    const diyas = await prisma.diya.findMany({
      where,
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { seq: BigInt(cursor) },
          }
        : {}),
      orderBy: {
        seq: "desc",
      },
      include: {
        wish: {
          select: {
            text: true,
            category: true,
            language: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    let results = diyas;

    if (diyas.length > limit) {
      const nextItem = diyas[limit];
      nextCursor = nextItem.seq.toString();
      results = diyas.slice(0, limit);
    }

    const formatted = results.map((d) => {
      const isVisible = d.wishVisible && d.status !== "HIDDEN";
      return {
        id: d.id,
        publicId: d.publicId,
        seq: Number(d.seq),
        style: d.style,
        locale: d.locale,
        wishText: isVisible
          ? d.customWish || d.wish?.text || "May this Diwali bring infinite peace and happiness."
          : "A quiet diya",
        dedication: isVisible
          ? d.dedicationText ||
            (d.dedication === "family"
              ? "For family"
              : d.dedication === "friends"
              ? "For friends"
              : d.dedication === "loved_ones"
              ? "For loved one"
              : d.dedication === "world"
              ? "For the world"
              : null)
          : null,
        createdAt: d.createdAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        diyas: formatted,
        nextCursor,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Wall data fetch error:", error);
    return NextResponse.json({ error: "Failed to load wall diyas" }, { status: 500 });
  }
}
