import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const key = "diyas_total";

  console.log("🔍 Starting DiyaVerse Counter Reconciliation...");

  try {
    const counterRecord = await prisma.counter.findUnique({
      where: { key },
    });

    const actualCount = await prisma.diya.count({
      where: { status: { not: "DELETED" } },
    });

    const storedBigInt = counterRecord ? counterRecord.value : BigInt(0);
    const actualBigInt = BigInt(actualCount);
    const discrepancy = actualBigInt !== storedBigInt;

    console.log(`Stored Counter (${key}): ${storedBigInt.toString()}`);
    console.log(`Actual Active/Published Diyas: ${actualBigInt.toString()}`);

    if (discrepancy) {
      console.warn(`⚠️ Discrepancy detected! Stored: ${storedBigInt}, Actual: ${actualBigInt}`);
      console.log("Correcting counter in database...");

      await prisma.counter.upsert({
        where: { key },
        create: { key, value: actualBigInt },
        update: { value: actualBigInt },
      });
      console.log("✅ Counter corrected to actual count.");
    } else {
      console.log("✅ Counter is already in perfect sync. No correction needed.");
    }

    const log = await prisma.counterReconciliation.create({
      data: {
        key,
        stored: storedBigInt,
        actual: actualBigInt,
        corrected: discrepancy,
      },
    });

    console.log(`📝 Audit recorded to CounterReconciliation (ID: ${log.id}) at ${log.at.toISOString()}`);
  } catch (err) {
    console.error("❌ Reconciliation failed with error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
