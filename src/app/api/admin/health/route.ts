import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    // Check Counter vs actual non-deleted Diya count
    const [counterRecord, actualCount] = await Promise.all([
      prisma.counter.findUnique({
        where: { key: "diyas_total" },
      }),
      prisma.diya.count({
        where: { status: { not: "DELETED" } },
      }),
    ]);

    const counterStored = counterRecord ? Number(counterRecord.value) : 0;
    const discrepancy = actualCount - counterStored;

    // Latest reconciliation
    const latestReconciliation = await prisma.counterReconciliation.findFirst({
      orderBy: { at: "desc" },
    });

    // Recent errors
    const recentErrors = await prisma.errorLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      db: {
        status: "UP",
        latencyMs: dbLatencyMs,
      },
      counter: {
        key: "diyas_total",
        stored: counterStored,
        actual: actualCount,
        discrepancy,
        inSync: discrepancy === 0,
        lastReconciled: latestReconciliation
          ? {
              at: latestReconciliation.at.toISOString(),
              corrected: latestReconciliation.corrected,
              stored: Number(latestReconciliation.stored),
              actual: Number(latestReconciliation.actual),
            }
          : null,
      },
      recentErrors: recentErrors.map((err) => ({
        id: err.id.toString(),
        scope: err.scope,
        message: err.message,
        createdAt: err.createdAt.toISOString(),
      })),
    });
  } catch (err: unknown) {
    console.error("Health check error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
