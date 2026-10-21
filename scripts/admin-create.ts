import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import fs from "node:fs";
import path from "node:path";

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const prisma = new PrismaClient();

const ARGON_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

async function main() {
  console.log("=== DiyaVerse Owner Admin Account Provisioning ===");

  const emailArg = process.argv.find((arg) => arg.startsWith("--email="))?.split("=")[1];
  const passArg = process.argv.find((arg) => arg.startsWith("--password="))?.split("=")[1];

  const email = emailArg || process.env.ADMIN_SEED_EMAIL || "owner@diyaverse.in";
  const password = passArg || process.env.ADMIN_SEED_PASSWORD || "SacredDiwali@2026!India";

  if (password.length < 4) {
    console.error("❌ Error: Admin password must be at least 4 characters long.");
    process.exit(1);
  }

  const passwordHash = await hash(password, ARGON_OPTIONS);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "OWNER",
    },
    create: {
      email,
      passwordHash,
      role: "OWNER",
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: "admin.create_owner",
      targetType: "AdminUser",
      targetId: admin.id,
      after: { email: admin.email, role: admin.role },
    },
  });

  console.log(`✔ Admin owner account successfully provisioned: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error("Failed to create admin account:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
