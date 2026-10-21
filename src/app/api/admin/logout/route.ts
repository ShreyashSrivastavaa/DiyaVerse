import { NextRequest, NextResponse } from "next/server";
import { destroyAdminSession, getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (session) {
      await prisma.auditLog.create({
        data: {
          adminId: session.admin.id,
          action: "admin.logout",
          targetType: "AdminUser",
          targetId: session.admin.id,
        },
      });
    }

    await destroyAdminSession();

    // Check if called via HTML form post or API fetch
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("text/html") || !acceptHeader.includes("application/json")) {
      return NextResponse.redirect(new URL("/admin/login", req.url), 303);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin logout error:", err);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
