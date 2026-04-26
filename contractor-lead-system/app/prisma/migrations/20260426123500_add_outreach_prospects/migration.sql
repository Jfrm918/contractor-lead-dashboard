CREATE TABLE IF NOT EXISTS "outreach_prospects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "trade" TEXT NOT NULL,
  "tier" TEXT NOT NULL,
  "fit_score" INTEGER NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "email_confidence" TEXT,
  "website" TEXT,
  "contact_url" TEXT,
  "source" TEXT,
  "source_url" TEXT,
  "rating" TEXT,
  "zip" TEXT,
  "fit_reason" TEXT NOT NULL,
  "madison_angle" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Not Contacted',
  "note" TEXT NOT NULL DEFAULT '',
  "last_contacted_at" TIMESTAMP(3),
  "follow_up_due_at" TIMESTAMP(3),
  "last_touched_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "outreach_prospects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "outreach_prospects_name_key" ON "outreach_prospects"("name");
CREATE INDEX IF NOT EXISTS "outreach_prospects_trade_idx" ON "outreach_prospects"("trade");
CREATE INDEX IF NOT EXISTS "outreach_prospects_tier_idx" ON "outreach_prospects"("tier");
CREATE INDEX IF NOT EXISTS "outreach_prospects_status_idx" ON "outreach_prospects"("status");
CREATE INDEX IF NOT EXISTS "outreach_prospects_fit_score_idx" ON "outreach_prospects"("fit_score");
