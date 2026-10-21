import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMutationAdmin } from "@/lib/auth/guard";

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

    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "Missing active boolean field" }, { status: 400 });
    }

    const existing = await prisma.wish.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    const [updated] = await prisma.$transaction([
      prisma.wish.update({
        where: { id },
        data: { active: body.active },
      }),
      prisma.auditLog.create({
        data: {
          adminId: auth.admin.id,
          action: "wish.toggle",
          targetType: "wish",
          targetId: id,
          before: { active: existing.active },
          after: { active: body.active },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      wish: {
        id: updated.id,
        active: updated.active,
      },
    });
  } catch (err) {
    console.error("Wish update error:", err);
    return NextResponse.json({ error: "Failed to update wish" }, { status: 500 });
  }
}
