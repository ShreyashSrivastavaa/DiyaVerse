import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getAdminSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleReconcile(req);
}

export async function POST(req: NextRequest) {
  return handleReconcile(req);
}

async function handleReconcile(req: NextRequest) {
  // Allow if authorized via CRON_SECRET OR active admin session
  const authHeader = req.headers.get("authorization");
  const cronSecret = env.CRON_SECRET || process.env.CRON_SECRET;
  const isCronAuthorized = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let isAdminAuthorized = false;
  if (!isCronAuthorized) {
    const session = await getAdminSession();
    if (session) isAdminAuthorized = true;
  }

  if (!isCronAuthorized && !isAdminAuthorized) {
    return NextResponse.json({ error: "Unauthorized reconcile trigger" }, { status: 401 });
  }

  try {
    const key = "diyas_total";

    // 1. Fetch stored counter and actual count in single transaction
    const result = await prisma.$transaction(async (tx) => {
      const counterRecord = await tx.counter.findUnique({
        where: { key },
      });

      const actualCount = await tx.diya.count({
        where: { status: { not: "DELETED" } },
      });

      const storedBigInt = counterRecord ? counterRecord.value : BigInt(0);
      const actualBigInt = BigInt(actualCount);
      const discrepancy = actualBigInt !== storedBigInt;

      if (discrepancy) {
        await tx.counter.upsert({
          where: { key },
          create: { key, value: actualBigInt },
          update: { value: actualBigInt },
        });
      }

      const log = await tx.counterReconciliation.create({
        data: {
          key,
          stored: storedBigInt,
          actual: actualBigInt,
          corrected: discrepancy,
        },
      });

      return {
        key,
        stored: Number(storedBigInt),
        actual: Number(actualBigInt),
        corrected: discrepancy,
        reconciliationId: log.id,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("Reconciliation error:", err);
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 500 });
  }
}
