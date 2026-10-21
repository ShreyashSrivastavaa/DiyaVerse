import "server-only";
import { hash, verify } from "@node-rs/argon2";

// OWASP recommended parameters for Argon2id
const ARGON_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 14) {
    throw new Error("Password must be at least 14 characters long.");
  }
  return hash(password, ARGON_OPTIONS);
}

export async function verifyPassword(hashStr: string, candidate: string): Promise<boolean> {
  try {
    return await verify(hashStr, candidate, ARGON_OPTIONS);
  } catch (err) {
    console.error("Argon2 verify error:", err);
    return false;
  }
}

let cachedDummyHash: string | null = null;

export async function getDummyHash(): Promise<string> {
  if (!cachedDummyHash) {
    cachedDummyHash = await hash("DummyTimingDefensePassword1234!", ARGON_OPTIONS);
  }
  return cachedDummyHash;
}
