import "@testing-library/jest-dom";
import { vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Mock server-only for tests
vi.mock("server-only", () => ({}));

// Load .env in test environment
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

// Mock Intl.Segmenter if not supported in test environment
if (typeof Intl !== "undefined" && !Intl.Segmenter) {
  // @ts-expect-error polyfill mock for tests
  Intl.Segmenter = class {
    segment(text: string) {
      return Array.from(text).map((char, index) => ({
        segment: char,
        index,
        input: text,
      }));
    }
  };
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
