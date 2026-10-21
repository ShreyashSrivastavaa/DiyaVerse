import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid PostgreSQL connection URL"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  IP_HASH_SALT: z.string().min(16, "IP_HASH_SALT must be at least 16 characters"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_RETENTION_DAYS: z.coerce.number().default(90),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_ENABLE_CONSENT_BANNER: z
    .string()
    .optional()
    .transform((val) => val !== "false"),
});

const isServer = typeof window === "undefined" || process.env.NODE_ENV === "test";

function parseEnv() {
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ENABLE_CONSENT_BANNER: process.env.NEXT_PUBLIC_ENABLE_CONSENT_BANNER,
  });

  if (!clientResult.success) {
    console.error("Invalid client environment variables:", clientResult.error.format());
    throw new Error("Invalid client environment variables");
  }

  if (!isServer) {
    return {
      ...clientResult.data,
      // server variables undefined on client
    } as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
  }

  const serverResult = serverSchema.safeParse(process.env);
  if (!serverResult.success) {
    console.error("Invalid server environment variables:", serverResult.error.format());
    throw new Error("Invalid server environment variables. Check .env configuration.");
  }

  return {
    ...serverResult.data,
    ...clientResult.data,
  };
}

export const env = parseEnv();
