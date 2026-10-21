import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { ReportStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "OPEN";

    const where: Prisma.ReportWhereInput = {};
    if (statusParam !== "ALL" && Object.values(ReportStatus).includes(statusParam as ReportStatus)) {
      where.status = statusParam as ReportStatus;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        diya: {
          select: {
            id: true,
            publicId: true,
            seq: true,
            status: true,
            style: true,
            customWish: true,
            dedicationText: true,
            wish: {
              select: {
                text: true,
              },
            },
            _count: {
              select: {
                reports: true,
              },
            },
          },
        },
      },
    });

    const items = reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      note: r.note,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() || null,
      resolvedBy: r.resolvedBy,
      diya: {
        id: r.diya.id,
        publicId: r.diya.publicId,
        seq: Number(r.diya.seq),
        status: r.diya.status,
        style: r.diya.style,
        dedicationText: r.diya.dedicationText,
        wishText: r.diya.customWish || r.diya.wish?.text || "",
        totalReportsForDiya: r.diya._count.reports,
      },
    }));

    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (err) {
    console.error("Admin reports list error:", err);
    return NextResponse.json({ error: "Failed to list reports" }, { status: 500 });
  }
}
