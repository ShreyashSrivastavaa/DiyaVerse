import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/db";
import { POST as createDiya } from "@/app/api/diyas/route";
import { GET as getDiya } from "@/app/api/diyas/[publicId]/route";
import { GET as getPublicStats } from "@/app/api/stats/public/route";
import { POST as reportDiya } from "@/app/api/reports/route";
import { NextRequest } from "next/server";

describe("Diya Creation & Lifecycle Integration Tests", () => {
  it("creates a diya in one transaction and increments counter atomically", async () => {
    // Read initial counter
    const initialCounter = await prisma.counter.findUnique({
      where: { key: "diyas_total" },
    });
    const initialValue = initialCounter ? Number(initialCounter.value) : 0;

    const idempotencyKey = crypto.randomUUID();
    const testIp = `192.168.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
    const req = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        idempotencyKey,
        style: "clay",
        locale: "en",
        wishText: "May this Diwali bring boundless joy and prosperity to your family.",
        dedication: "family",
      }),
    });

    const res = await createDiya(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.publicId).toBeDefined();
    expect(data.style).toBe("clay");
    expect(data.wish.text).toBe("May this Diwali bring boundless joy and prosperity to your family.");

    // Verify counter incremented by exactly 1
    const updatedCounter = await prisma.counter.findUnique({
      where: { key: "diyas_total" },
    });
    expect(Number(updatedCounter!.value)).toBe(initialValue + 1);

    // Verify fetched via GET /api/diyas/[publicId]
    const getReq = new NextRequest(`http://localhost:3000/api/diyas/${data.publicId}`);
    const getRes = await getDiya(getReq, { params: Promise.resolve({ publicId: data.publicId }) });
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.publicId).toBe(data.publicId);
  });

  it("resolves duplicate requests with same idempotencyKey without creating new row or incrementing counter", async () => {
    const idempotencyKey = crypto.randomUUID();
    const payload = {
      idempotencyKey,
      style: "lotus",
      locale: "en",
      wishText: "Wishing everyone peace and abundant light this sacred season.",
    };

    const testIp2 = `192.168.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
    // First request: 201 Created
    const req1 = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp2 },
      body: JSON.stringify(payload),
    });
    const res1 = await createDiya(req1);
    expect(res1.status).toBe(201);
    const data1 = await res1.json();

    const counterAfterFirst = await prisma.counter.findUnique({ where: { key: "diyas_total" } });
    const countVal = Number(counterAfterFirst!.value);

    // Second request with same idempotencyKey: 200 OK (idempotent recovery)
    const req2 = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp2 },
      body: JSON.stringify(payload),
    });
    const res2 = await createDiya(req2);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();

    // Must return the exact same publicId and data
    expect(data2.publicId).toBe(data1.publicId);

    // Counter must NOT have changed
    const counterAfterSecond = await prisma.counter.findUnique({ where: { key: "diyas_total" } });
    expect(Number(counterAfterSecond!.value)).toBe(countVal);
  });

  it("rejects wishes with phone numbers or profanity with 422 and does NOT increment counter", async () => {
    const counterBefore = await prisma.counter.findUnique({ where: { key: "diyas_total" } });
    const countVal = Number(counterBefore!.value);

    const testIp3 = `192.168.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
    const req = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp3 },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        style: "golden",
        locale: "en",
        wishText: "Call me for Diwali sweets at 9876543210 right now!",
      }),
    });

    const res = await createDiya(req);
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.code).toBe("WISH_REJECTED");

    // Verify counter did not change
    const counterAfter = await prisma.counter.findUnique({ where: { key: "diyas_total" } });
    expect(Number(counterAfter!.value)).toBe(countVal);
  });

  it("automatically hides wish when 3 distinct reporters submit reports", async () => {
    // Create a diya
    const idempotencyKey = crypto.randomUUID();
    const testIp4 = `192.168.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
    const createReq = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": testIp4 },
      body: JSON.stringify({
        idempotencyKey,
        style: "marigold",
        locale: "en",
        wishText: "A wish that will be reported by multiple community members.",
      }),
    });
    const createRes = await createDiya(createReq);
    const { publicId } = await createRes.json();

    // Reporter 1
    const r1 = await reportDiya(
      new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
        body: JSON.stringify({ diyaPublicId: publicId, reason: "spam" }),
      })
    );
    expect(r1.status).toBe(200);

    // Reporter 2
    const r2 = await reportDiya(
      new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
        body: JSON.stringify({ diyaPublicId: publicId, reason: "spam" }),
      })
    );
    expect(r2.status).toBe(200);

    // Before 3rd report, wishVisible should still be true
    const diyaBefore3 = await prisma.diya.findUnique({ where: { publicId } });
    expect(diyaBefore3?.wishVisible).toBe(true);

    // Reporter 3
    const r3 = await reportDiya(
      new NextRequest("http://localhost:3000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.3" },
        body: JSON.stringify({ diyaPublicId: publicId, reason: "spam" }),
      })
    );
    expect(r3.status).toBe(200);

    // After 3rd report, wishVisible must be false (auto-hidden)
    const diyaAfter3 = await prisma.diya.findUnique({ where: { publicId } });
    expect(diyaAfter3?.wishVisible).toBe(false);

    // Public API should mask the wish as "A quiet diya glowing silently."
    const getRes = await getDiya(new NextRequest(`http://localhost:3000/api/diyas/${publicId}`), {
      params: Promise.resolve({ publicId }),
    });
    const getData = await getRes.json();
    expect(getData.wish.text).toBe("A quiet diya");
  });

  it("reconciles stats via GET /api/stats/public with actual published rows", async () => {
    const res = await getPublicStats();
    expect(res.status).toBe(200);
    const stats = await res.json();
    expect(stats.diyasLit).toBeGreaterThan(0);
    expect(stats.wishesShared).toBeGreaterThan(0);

    // Verify against actual row count in DB where status != DELETED
    const rowCount = await prisma.diya.count({
      where: { status: { not: "DELETED" } },
    });
    expect(stats.diyasLit).toBe(rowCount);
  });

  it("successfully creates a diya with dedication 'loved_ones' and attribution 'ref'", async () => {
    const idempotencyKey = crypto.randomUUID();
    const testIp = `192.168.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 250 + 1)}`;
    const req = new NextRequest("http://localhost:3000/api/diyas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": testIp,
      },
      body: JSON.stringify({
        idempotencyKey,
        style: "marigold",
        locale: "en",
        wishText: "May love and joy surround you and your loved ones always.",
        dedication: "loved_ones",
        attribution: {
          ref: "TESTREF123",
        },
      }),
    });

    const res = await createDiya(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.publicId).toBeDefined();
    expect(data.dedication).toBe("loved_ones");
  });
});
