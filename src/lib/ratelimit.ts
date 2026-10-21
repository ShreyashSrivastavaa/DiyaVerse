import "server-only";
import { prisma } from "./db";
import crypto from "node:crypto";
import { env } from "./env";

/**
 * Creates a privacy-preserving daily-rotating salted hash of an IP address.
 * Never stores or exposes the raw IP address.
 */
export function getDailyIpHash(ip: string): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const salt = env.IP_HASH_SALT;
  return crypto
    .createHash("sha256")
    .update(`${ip}:${today}:${salt}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Derives a client identity from request headers and session ID.
 */
export function getClientIdentity(req: Request, sessionId?: string | null): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";
  const ipHash = getDailyIpHash(rawIp);

  if (sessionId) {
    return `${ipHash}:${sessionId}`;
  }
  return ipHash;
}

export interface RateLimitOptions {
  key: string;
  max: number;
  windowMs: number; // in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * Atomic sliding window rate limiter backed by Postgres RateLimit table.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / options.windowMs) * options.windowMs);
  const resetAt = new Date(windowStart.getTime() + options.windowMs);

  try {
    const record = await prisma.rateLimit.upsert({
      where: {
        key_windowStart: {
          key: options.key,
          windowStart,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        key: options.key,
        windowStart,
        count: 1,
      },
    });

    const success = record.count <= options.max;
    const remaining = Math.max(0, options.max - record.count);

    return {
      success,
      limit: options.max,
      remaining,
      resetAt,
    };
  } catch (error) {
    // If rate limiting fails (e.g. transient DB issue), log and fail open to not degrade UX
    console.error("Rate limit check error:", error);
    return {
      success: true,
      limit: options.max,
      remaining: 1,
      resetAt,
    };
  }
}

/**
 * Checks whether a rate limit threshold has been exceeded without incrementing.
 */
export async function peekRateLimit(options: RateLimitOptions): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / options.windowMs) * options.windowMs);

  try {
    const record = await prisma.rateLimit.findUnique({
      where: {
        key_windowStart: {
          key: options.key,
          windowStart,
        },
      },
    });

    return !record || record.count < options.max;
  } catch (error) {
    console.error("Rate limit peek error:", error);
    return true;
  }
}
