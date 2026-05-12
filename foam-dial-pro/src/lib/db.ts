import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function makePrisma() {
  const connStr = process.env.DATABASE_URL || "";
  if (!connStr) {
    console.error("[DB] DATABASE_URL not set");
  }
  const adapter = new PrismaPg({ connectionString: connStr });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
