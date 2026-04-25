import { z } from "zod";

/**
 * Environment variable schema.
 * DATABASE_URL is optional in dev — the app falls back to a mock layer
 * when it's missing so the frontend still works without Postgres.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const env = parseEnv();

/** True when a real Postgres connection string is configured. */
export const hasDatabaseUrl = Boolean(env.DATABASE_URL);
