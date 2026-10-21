import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "../db";

export const COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";

const SESSION_ABSOLUTE_LIFETIME_MS = 12 * 60 * 60 * 1000; // 12 hours
const SESSION_IDLE_LIFETIME_MS = 2 * 60 * 60 * 1000; // 2 hours

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(adminId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_IDLE_LIFETIME_MS);

  await prisma.adminSession.create({
    data: {
      id: tokenHash,
      adminId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_ABSOLUTE_LIFETIME_MS / 1000,
  });

  return token;
}

export async function getAdminSession(): Promise<{
  admin: { id: string; email: string; role: string };
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { id: tokenHash },
    include: { admin: true },
  });

  if (!session) return null;

  const now = new Date();
  if (now > session.expiresAt) {
    // Session expired
    await prisma.adminSession.delete({ where: { id: tokenHash } }).catch(() => {});
    return null;
  }

  // Check absolute lifetime
  if (now.getTime() - session.createdAt.getTime() > SESSION_ABSOLUTE_LIFETIME_MS) {
    await prisma.adminSession.delete({ where: { id: tokenHash } }).catch(() => {});
    return null;
  }

  // Extend idle expiration
  const newIdleExpires = new Date(now.getTime() + SESSION_IDLE_LIFETIME_MS);
  await prisma.adminSession.update({
    where: { id: tokenHash },
    data: { expiresAt: newIdleExpires },
  });

  return {
    admin: {
      id: session.admin.id,
      email: session.admin.email,
      role: session.admin.role,
    },
    sessionId: session.id,
  };
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.adminSession.delete({ where: { id: tokenHash } }).catch(() => {});
  }
  cookieStore.delete(COOKIE_NAME);
}
