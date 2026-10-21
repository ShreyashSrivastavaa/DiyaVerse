import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMutationAdmin } from "@/lib/auth/guard";
import { ReportStatus, DiyaStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMutationAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action as "DISMISS" | "HIDE_DIYA" | "DELETE_DIYA";

    if (!["DISMISS", "HIDE_DIYA", "DELETE_DIYA"].includes(action)) {
      return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { diya: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === "DISMISS") {
      await prisma.$transaction([
        prisma.report.update({
          where: { id },
          data: {
            status: ReportStatus.DISMISSED,
            resolvedAt: now,
            resolvedBy: auth.admin.email,
          },
        }),
        prisma.auditLog.create({
          data: {
            adminId: auth.admin.id,
            action: "report.dismiss",
            targetType: "report",
            targetId: id,
            before: { status: report.status },
            after: { status: ReportStatus.DISMISSED },
          },
        }),
      ]);
    } else {
      const newDiyaStatus =
        action === "HIDE_DIYA" ? DiyaStatus.HIDDEN : DiyaStatus.DELETED;

      await prisma.$transaction([
        prisma.report.update({
          where: { id },
          data: {
            status: ReportStatus.ACTIONED,
            resolvedAt: now,
            resolvedBy: auth.admin.email,
          },
        }),
        prisma.diya.update({
          where: { id: report.diyaId },
          data: { status: newDiyaStatus },
        }),
        prisma.auditLog.create({
          data: {
            adminId: auth.admin.id,
            action: action === "HIDE_DIYA" ? "report.action_hide" : "report.action_delete",
            targetType: "diya",
            targetId: report.diyaId,
            before: {
              reportStatus: report.status,
              diyaStatus: report.diya.status,
            },
            after: {
              reportStatus: ReportStatus.ACTIONED,
              diyaStatus: newDiyaStatus,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Moderation action error:", err);
    return NextResponse.json({ error: "Failed to action report" }, { status: 500 });
  }
}
