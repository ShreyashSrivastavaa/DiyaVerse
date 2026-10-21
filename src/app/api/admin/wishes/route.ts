import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "25", 10)));
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const active = searchParams.get("active");
    const q = searchParams.get("q")?.trim();

    const where: Prisma.WishWhereInput = {};

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (language && language !== "ALL") {
      where.language = language;
    }

    if (active === "true") {
      where.active = true;
    } else if (active === "false") {
      where.active = false;
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { text: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.wish.count({ where }),
      prisma.wish.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          text: true,
          category: true,
          language: true,
          tone: true,
          tags: true,
          active: true,
          version: true,
        },
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin wishes list error:", err);
    return NextResponse.json({ error: "Failed to list wishes" }, { status: 500 });
  }
}
