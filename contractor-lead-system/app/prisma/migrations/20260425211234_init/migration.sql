-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'onboarding',
    "plan_tier" TEXT NOT NULL DEFAULT 'starter',
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_settings" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "tracked_number" TEXT,
    "forwarding_number" TEXT,
    "after_hours_number" TEXT,
    "call_recording" BOOLEAN NOT NULL DEFAULT false,
    "abandoned_call_threshold_sec" INTEGER NOT NULL DEFAULT 15,
    "alert_recipients" JSONB NOT NULL DEFAULT '[]',
    "service_areas" JSONB NOT NULL DEFAULT '[]',
    "services_offered" JSONB NOT NULL DEFAULT '[]',
    "office_hours" JSONB NOT NULL DEFAULT '{}',
    "weekend_hours" JSONB NOT NULL DEFAULT '{}',
    "qualification_questions" JSONB NOT NULL DEFAULT '[]',
    "disqualifier_rules" JSONB NOT NULL DEFAULT '[]',
    "high_priority_rules" JSONB NOT NULL DEFAULT '[]',
    "sms_templates" JSONB NOT NULL DEFAULT '{}',
    "message_timing" JSONB NOT NULL DEFAULT '{}',
    "booking_mode" TEXT NOT NULL DEFAULT 'manual_callback',
    "booking_url" TEXT,
    "workflow_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
    "alerts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "phone" TEXT NOT NULL,
    "caller_name" TEXT,
    "source" TEXT,
    "trade" TEXT,
    "service_type" TEXT,
    "city" TEXT,
    "urgency" TEXT,
    "qualification_state" TEXT NOT NULL DEFAULT 'pending',
    "qualification_answers" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'new',
    "missed_call" BOOLEAN NOT NULL DEFAULT false,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "call_sid" TEXT,
    "call_outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_events" (
    "id" UUID NOT NULL,
    "lead_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_settings_client_id_key" ON "client_settings"("client_id");

-- CreateIndex
CREATE INDEX "leads_client_id_idx" ON "leads"("client_id");

-- CreateIndex
CREATE INDEX "leads_phone_idx" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE INDEX "lead_events_lead_id_idx" ON "lead_events"("lead_id");

-- CreateIndex
CREATE INDEX "lead_events_client_id_idx" ON "lead_events"("client_id");

-- CreateIndex
CREATE INDEX "lead_events_event_type_idx" ON "lead_events"("event_type");

-- CreateIndex
CREATE INDEX "lead_events_created_at_idx" ON "lead_events"("created_at");

-- AddForeignKey
ALTER TABLE "client_settings" ADD CONSTRAINT "client_settings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
