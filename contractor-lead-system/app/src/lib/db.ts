import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hasDatabaseUrl, env } from "./env";

/**
 * Singleton Prisma client (avoids exhausting connections during hot-reload).
 * Returns `null` when DATABASE_URL is not configured — callers should
 * fall back to the mock data layer in that case.
 */
function createPrismaClient(): PrismaClient | null {
  if (!hasDatabaseUrl) {
    console.warn("⚠️  DATABASE_URL not set — running in mock-data mode");
    return null;
  }
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** True when the database is available for queries. */
export const dbAvailable = prisma !== null;
