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
    const action = searchParams.get("action");

    const where: Prisma.AuditLogWhereInput = {};
    if (action && action !== "ALL") {
      where.action = action;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Fetch admin user emails for adminIds
    const adminIds = Array.from(new Set(logs.map((l) => l.adminId)));
    const admins = await prisma.adminUser.findMany({
      where: { id: { in: adminIds } },
      select: { id: true, email: true },
    });
    const adminMap = new Map(admins.map((a) => [a.id, a.email]));

    const items = logs.map((log) => ({
      id: log.id.toString(),
      adminId: log.adminId,
      adminEmail: adminMap.get(log.adminId) || log.adminId,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      before: log.before,
      after: log.after,
      createdAt: log.createdAt.toISOString(),
    }));

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
    console.error("Admin audit log error:", err);
    return NextResponse.json({ error: "Failed to list audit logs" }, { status: 500 });
  }
}
