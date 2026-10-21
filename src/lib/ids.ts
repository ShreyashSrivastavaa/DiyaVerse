import { customAlphabet } from "nanoid";

// 62-character URL safe alphabet without hyphens or underscores for crisp clean URLs
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid10 = customAlphabet(alphabet, 10);

export function generatePublicId(): string {
  return nanoid10();
}

export function isValidPublicId(id: string): boolean {
  return /^[0-9a-zA-Z]{10}$/.test(id);
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  );
}
