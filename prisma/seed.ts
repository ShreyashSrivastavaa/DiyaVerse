import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

interface WishRecord {
  id: string;
  text: string;
  category: string;
  language: string;
  tone?: string;
  tags: string[];
  active: boolean;
  version?: number;
}

async function main() {
  console.log("Starting DiyaVerse database seeding...");

  // 1. Initialize Counters
  console.log("Initializing truthful counter rows...");
  await prisma.counter.upsert({
    where: { key: "diyas_total" },
    update: {},
    create: {
      key: "diyas_total",
      value: BigInt(0),
    },
  });

  await prisma.counter.upsert({
    where: { key: "wishes_shared" },
    update: {},
    create: {
      key: "wishes_shared",
      value: BigInt(0),
    },
  });

  // 2. Load and Seed 2,000 Wishes from data/wishes/
  const wishesDir = path.resolve(__dirname, "../data/wishes");
  if (!fs.existsSync(wishesDir)) {
    throw new Error(`Wishes directory not found at ${wishesDir}`);
  }

  const files = fs.readdirSync(wishesDir).filter((f) => f.endsWith(".json"));
  let totalWishes = 0;

  for (const file of files) {
    const filePath = path.join(wishesDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const wishes: WishRecord[] = JSON.parse(raw);

    console.log(`Seeding ${wishes.length} wishes from ${file}...`);

    // Batch insert using createMany with skipDuplicates or transaction chunks
    const data = wishes.map((w) => ({
      id: w.id,
      text: w.text,
      category: w.category,
      language: w.language,
      tone: w.tone ?? null,
      tags: w.tags ?? [],
      active: w.active ?? true,
      version: w.version ?? 1,
    }));

    await prisma.wish.createMany({
      data,
      skipDuplicates: true,
    });

    totalWishes += wishes.length;
  }

  const seededCount = await prisma.wish.count();
  console.log(`\nSuccessfully verified ${seededCount} total wishes in database!`);
  console.log("Counter 'diyas_total' initialized at 0 (honest zero state).");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
