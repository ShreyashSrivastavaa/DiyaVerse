import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const CSRF_COOKIE_NAME = "admin_csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

export async function setCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(24).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Accessible to client JavaScript for double-submit header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 12 * 3600,
  });
  return token;
}

export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  const headerToken = req.headers.get(CSRF_HEADER_NAME);
  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) return false;

  // Constant-time string comparison
  return (
    headerToken.length === cookieToken.length &&
    crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))
  );
}
