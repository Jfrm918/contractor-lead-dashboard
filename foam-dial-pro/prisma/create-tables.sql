-- FoamDial Pro tables (coexisting with LeadRecovery Pro tables)

CREATE TABLE IF NOT EXISTS "FoamCompany" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FoamCompany_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FoamUser" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'installer',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FoamUser_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FoamUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "FoamCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "FoamUser_email_key" ON "FoamUser"("email");

CREATE TABLE IF NOT EXISTS "FoamSystem" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "manufacturer" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rValue" DOUBLE PRECISION NOT NULL,
    "yieldPerSet" INTEGER NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT '1:1',
    "minTemp" INTEGER NOT NULL,
    "maxTemp" INTEGER NOT NULL,
    "substrates" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoamSystem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FoamJob" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "foamSystemId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "substrate" TEXT,
    "setsUsed" DOUBLE PRECISION,
    "boardFeet" DOUBLE PRECISION,
    "squareFeet" DOUBLE PRECISION,
    "thickness" DOUBLE PRECISION,
    "ambientTemp" DOUBLE PRECISION,
    "substrateTemp" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "dewPoint" DOUBLE PRECISION,
    "hoseTempA" DOUBLE PRECISION,
    "hoseTempB" DOUBLE PRECISION,
    "drumTempA" DOUBLE PRECISION,
    "drumTempB" DOUBLE PRECISION,
    "pressureA" DOUBLE PRECISION,
    "pressureB" DOUBLE PRECISION,
    "rating" INTEGER,
    "problems" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "yieldActual" DOUBLE PRECISION,
    "yieldTarget" DOUBLE PRECISION,
    "yieldVariance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FoamJob_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FoamJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "FoamCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoamJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "FoamUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FoamJob_foamSystemId_fkey" FOREIGN KEY ("foamSystemId") REFERENCES "FoamSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "FoamJob_companyId_idx" ON "FoamJob"("companyId");
CREATE INDEX IF NOT EXISTS "FoamJob_userId_idx" ON "FoamJob"("userId");
CREATE INDEX IF NOT EXISTS "FoamJob_date_idx" ON "FoamJob"("date");

CREATE TABLE IF NOT EXISTS "FoamEquipment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNum" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FoamEquipment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FoamEquipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "FoamCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FoamDiagnostic" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "problem" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "causes" JSONB NOT NULL DEFAULT '[]',
    "fixes" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoamDiagnostic_pkey" PRIMARY KEY ("id")
);

-- Job Sites (multi-day project tracking)
CREATE TABLE IF NOT EXISTS "FoamJobSite" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "jobType" TEXT,
    "substrate" TEXT,
    "foamSystemId" TEXT,
    "estimatedSets" FLOAT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoamJobSite_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FoamJobSite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "FoamCompany"("id") ON DELETE RESTRICT,
    CONSTRAINT "FoamJobSite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "FoamUser"("id") ON DELETE RESTRICT,
    CONSTRAINT "FoamJobSite_foamSystemId_fkey" FOREIGN KEY ("foamSystemId") REFERENCES "FoamSystem"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "FoamJobSite_companyId_idx" ON "FoamJobSite"("companyId");
CREATE INDEX IF NOT EXISTS "FoamJobSite_status_idx" ON "FoamJobSite"("status");

-- Add jobSiteId to FoamJob for linking daily logs to sites
ALTER TABLE "FoamJob" ADD COLUMN IF NOT EXISTS "jobSiteId" TEXT REFERENCES "FoamJobSite"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "FoamJob_jobSiteId_idx" ON "FoamJob"("jobSiteId");

-- Mark these tables as managed by Prisma
CREATE TABLE IF NOT EXISTS "_prisma_migrations_foam" (
    "id" TEXT NOT NULL,
    CONSTRAINT "_prisma_migrations_foam_pkey" PRIMARY KEY ("id")
);
