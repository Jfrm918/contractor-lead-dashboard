-- Add competitor_audit_rows to client_settings (for Local Response Speed Audit™ persistence)
ALTER TABLE "client_settings" ADD COLUMN "competitor_audit_rows" JSONB NOT NULL DEFAULT '[]';

-- CreateTable sms_jobs (DB-backed SMS job queue — replaces fragile setTimeout approach)
CREATE TABLE "sms_jobs" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "to_phone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "fail_reason" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sms_jobs_scheduled_at_processed_at_idx" ON "sms_jobs"("scheduled_at", "processed_at");
