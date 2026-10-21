import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { DiyaStatus, Prisma } from "@prisma/client";

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
    const status = searchParams.get("status") || "ALL";
    const style = searchParams.get("style");
    const q = searchParams.get("q")?.trim();

    const where: Prisma.DiyaWhereInput = {};

    if (status !== "ALL" && Object.values(DiyaStatus).includes(status as DiyaStatus)) {
      where.status = status as DiyaStatus;
    }

    if (style && style !== "ALL") {
      where.style = style;
    }

    if (q) {
      where.OR = [
        { publicId: { contains: q, mode: "insensitive" } },
        { dedicationText: { contains: q, mode: "insensitive" } },
        { customWish: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.diya.count({ where }),
      prisma.diya.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          publicId: true,
          seq: true,
          style: true,
          locale: true,
          wishSource: true,
          customWish: true,
          dedication: true,
          dedicationText: true,
          status: true,
          createdAt: true,
          wish: {
            select: {
              id: true,
              text: true,
              category: true,
              language: true,
            },
          },
          _count: {
            select: {
              reports: true,
            },
          },
        },
      }),
    ]);

    const formatted = items.map((d) => ({
      id: d.id,
      publicId: d.publicId,
      seq: Number(d.seq),
      style: d.style,
      locale: d.locale,
      wishSource: d.wishSource,
      wishText: d.customWish || d.wish?.text || "",
      dedication: d.dedication,
      dedicationText: d.dedicationText,
      status: d.status,
      reportsCount: d._count.reports,
      createdAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin diyas list error:", err);
    return NextResponse.json({ error: "Failed to list diyas" }, { status: 500 });
  }
}
