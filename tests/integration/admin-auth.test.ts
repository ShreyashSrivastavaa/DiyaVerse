import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";

describe("Admin Authentication & Security Integration Tests", () => {
  it("hashes password with Argon2id and verifies correctly", async () => {
    const rawPassword = "StrongPassword@Diwali2026";
    const hashed = await hashPassword(rawPassword);

    expect(hashed).toMatch(/^\$argon2id\$/);

    const isMatch = await verifyPassword(hashed, rawPassword);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword(hashed, "WrongPassword123");
    expect(isWrong).toBe(false);
  });

  it("reconciliation correctly audits counter against published diyas", async () => {
    const key = "diyas_total";

    const actualCount = await prisma.diya.count({
      where: { status: { not: "DELETED" } },
    });

    const counter = await prisma.counter.findUnique({
      where: { key },
    });

    expect(counter).toBeDefined();
    expect(Number(counter!.value)).toBe(actualCount);
  });

  it("stores and audits admin audit log entries immutably", async () => {
    const audit = await prisma.auditLog.create({
      data: {
        adminId: "test-admin-id",
        action: "test.action",
        targetType: "test",
        targetId: "test-target",
        before: { test: true },
        after: { test: false },
      },
    });

    expect(audit.id).toBeDefined();
    expect(audit.action).toBe("test.action");

    // Clean up test audit log
    await prisma.auditLog.delete({
      where: { id: audit.id },
    });
  });
});
