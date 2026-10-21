import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, getDummyHash } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { setCsrfToken } from "@/lib/auth/csrf";
import { checkRateLimit, getDailyIpHash, peekRateLimit } from "@/lib/ratelimit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipHash = getDailyIpHash(ip);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Rate limiting: check if already locked out (5 failed attempts per 15 minutes)
    const ipAllowed = await peekRateLimit({
      key: `admin:login:fail:ip:${ipHash}`,
      max: 5,
      windowMs: 15 * 60 * 1000,
    });

    const emailAllowed = await peekRateLimit({
      key: `admin:login:fail:email:${email}`,
      max: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!ipAllowed || !emailAllowed) {
      return NextResponse.json(
        { error: "Too many failed login attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    let isValid = false;
    if (admin) {
      isValid = await verifyPassword(admin.passwordHash, password);
    } else {
      // Fake verification delay to protect against timing attacks
      const dummy = await getDummyHash();
      await verifyPassword(dummy, password).catch(() => {});
    }

    if (!isValid || !admin) {
      // Increment failed attempt counters
      await Promise.all([
        checkRateLimit({
          key: `admin:login:fail:ip:${ipHash}`,
          max: 5,
          windowMs: 15 * 60 * 1000,
        }),
        checkRateLimit({
          key: `admin:login:fail:email:${email}`,
          max: 5,
          windowMs: 15 * 60 * 1000,
        }),
        prisma.auditLog.create({
          data: {
            adminId: admin ? admin.id : "unauthenticated",
            action: "admin.login_failed",
            targetType: "AdminUser",
            targetId: email,
            before: { ipHash },
          },
        }),
      ]);

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Success! Create server-side session and CSRF token
    await createAdminSession(admin.id);
    const csrfToken = await setCsrfToken();

    // Log successful login
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "admin.login_success",
        targetType: "AdminUser",
        targetId: admin.id,
        after: { role: admin.role },
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      csrfToken,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
