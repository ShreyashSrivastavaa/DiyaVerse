import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMutationAdmin } from "@/lib/auth/guard";
import { DiyaStatus } from "@prisma/client";

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
    const newStatus = body.status as DiyaStatus;

    if (!newStatus || !Object.values(DiyaStatus).includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const existing = await prisma.diya.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Diya not found" }, { status: 404 });
    }

    const action =
      newStatus === DiyaStatus.DELETED
        ? "diya.delete"
        : newStatus === DiyaStatus.HIDDEN
        ? "diya.hide"
        : "diya.restore";

    const [updated] = await prisma.$transaction([
      prisma.diya.update({
        where: { id },
        data: { status: newStatus },
      }),
      prisma.auditLog.create({
        data: {
          adminId: auth.admin.id,
          action,
          targetType: "diya",
          targetId: id,
          before: { status: existing.status },
          after: { status: newStatus },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      diya: {
        id: updated.id,
        publicId: updated.publicId,
        status: updated.status,
      },
    });
  } catch (err) {
    console.error("Update diya status error:", err);
    return NextResponse.json({ error: "Failed to update diya status" }, { status: 500 });
  }
}
