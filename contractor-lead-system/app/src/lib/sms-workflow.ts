/**
 * SMS Missed-Call Recovery Workflow
 *
 * When a missed call is detected the workflow:
 *   1. Looks up the client's SMS templates and timing from ClientSettings
 *   2. Schedules the initial SMS after the configured delay (default 60s)
 *   3. Logs a "sms_sent" LeadEvent
 *
 * Follow-up messages are triggered by subsequent timer invocations
 * (not covered by the initial webhook — a cron or queue worker picks
 * those up based on LeadEvent history).
 */

import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";
import { sendSms, twilioConfigured } from "@/lib/twilio";
import { DEFAULT_MISSED_CALL_ACK } from "@/lib/lead-filter";

// ─── Types ───

interface SmsTemplates {
  initial?: string;
  followup1?: string;
  followup2?: string;
  [key: string]: string | undefined;
}

interface MessageTiming {
  initialDelaySec?: number;
  followup1DelaySec?: number;
  followup2DelaySec?: number;
  [key: string]: number | undefined;
}

interface ClientSettings {
  smsEnabled: boolean;
  smsTemplates: SmsTemplates;
  messageTiming: MessageTiming;
  clientCompanyName?: string;
  missedCallAckTemplate?: string | null;
}

interface WorkflowResult {
  triggered: boolean;
  reason?: string;
  messageSid?: string;
}

// ─── Template helpers ───

function interpolateTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

// ─── Settings lookup ───

async function getClientSettings(
  clientId: string,
): Promise<ClientSettings | null> {
  if (dbAvailable) {
    const settings = await prisma!.clientSettings.findUnique({
      where: { clientId },
      include: { client: { select: { companyName: true } } },
    });
    if (!settings) return null;
    return {
      smsEnabled: settings.smsEnabled,
      smsTemplates: (settings.smsTemplates ?? {}) as SmsTemplates,
      messageTiming: (settings.messageTiming ?? {}) as MessageTiming,
      clientCompanyName: settings.client.companyName,
      missedCallAckTemplate: settings.missedCallAckTemplate,
    };
  }

  // Mock fallback
  const mockSettings = mockDb.findSettings(clientId);
  if (!mockSettings) return null;
  const mockClient = mockDb.findClient(clientId);
  return {
    smsEnabled: mockSettings.smsEnabled,
    smsTemplates: mockSettings.smsTemplates as SmsTemplates,
    messageTiming: mockSettings.messageTiming as MessageTiming,
    clientCompanyName: mockClient?.companyName,
    missedCallAckTemplate: mockSettings.missedCallAckTemplate ?? null,
  };
}

// ─── Core workflow ───

/**
 * Trigger the missed-call SMS recovery workflow for a lead.
 *
 * When the database is available, this writes a persisted SmsJob record that
 * is picked up and sent by the /api/cron/process-sms-jobs endpoint every 2
 * minutes. This survives server restarts.
 *
 * In mock/dev mode (no DB), falls back to the original setTimeout approach.
 */
export async function triggerMissedCallSmsWorkflow(
  leadId: string,
  clientId: string,
  callerPhone: string,
  callerName?: string | null,
): Promise<WorkflowResult> {
  // Guard: Twilio must be configured
  if (!twilioConfigured()) {
    console.warn("[SMS Workflow] Twilio not configured — skipping");
    return { triggered: false, reason: "twilio_not_configured" };
  }

  // Guard: client must have SMS enabled
  const settings = await getClientSettings(clientId);
  if (!settings) {
    return { triggered: false, reason: "no_client_settings" };
  }
  if (!settings.smsEnabled) {
    return { triggered: false, reason: "sms_disabled" };
  }

  const initialTemplate = settings.smsTemplates.initial;
  if (!initialTemplate) {
    return { triggered: false, reason: "no_initial_template" };
  }

  const delaySec = settings.messageTiming.initialDelaySec ?? 60;

  // Build the message body
  const body = interpolateTemplate(initialTemplate, {
    name: callerName ?? "there",
    company: settings.clientCompanyName ?? "our team",
  });

  // Schedule the send after the configured delay.
  await scheduleInitialSms({
    leadId,
    clientId,
    to: callerPhone,
    body,
    delaySec,
  });

  return { triggered: true };
}

/**
 * Send a neutral missed-call acknowledgment to an unknown caller.
 *
 * This is NOT a sales pitch — it's a polite "we missed your call" text
 * that lets the caller self-identify by replying QUOTE. Only responders
 * get entered into the active lead recovery pipeline.
 *
 * One text per first-time unknown caller. No follow-ups unless they reply.
 */
export async function triggerMissedCallAck(
  leadId: string,
  clientId: string,
  callerPhone: string,
  callerName?: string | null,
): Promise<WorkflowResult> {
  if (!twilioConfigured()) {
    return { triggered: false, reason: "twilio_not_configured" };
  }

  const settings = await getClientSettings(clientId);
  if (!settings) {
    return { triggered: false, reason: "no_client_settings" };
  }
  if (!settings.smsEnabled) {
    return { triggered: false, reason: "sms_disabled" };
  }

  // Use the client's custom ack template, or the default
  const ackTemplate = settings.missedCallAckTemplate || DEFAULT_MISSED_CALL_ACK;

  const body = interpolateTemplate(ackTemplate, {
    name: callerName ?? "there",
    company: settings.clientCompanyName ?? "our team",
  });

  // Schedule with a short delay (30s) — just enough to not feel instant/robotic
  await scheduleInitialSms({
    leadId,
    clientId,
    to: callerPhone,
    body,
    delaySec: 30,
  });

  return { triggered: true };
}

// ─── Scheduling ───

interface ScheduledSms {
  leadId: string;
  clientId: string;
  to: string;
  body: string;
  delaySec: number;
}

/**
 * Persist a scheduled SMS job.
 *
 * DB mode (production): writes a row to sms_jobs that the cron processor
 * picks up after `scheduledAt`. Survives server restarts.
 *
 * Mock mode (dev/no-DB): falls back to setTimeout so local dev still works.
 */
async function scheduleInitialSms(sms: ScheduledSms): Promise<void> {
  if (dbAvailable) {
    const scheduledAt = new Date(Date.now() + sms.delaySec * 1000);
    await prisma!.smsJob.create({
      data: {
        leadId: sms.leadId,
        clientId: sms.clientId,
        toPhone: sms.to,
        body: sms.body,
        scheduledAt,
      },
    });
    console.log(
      `[SMS Workflow] Job persisted — will send at ${scheduledAt.toISOString()} (lead ${sms.leadId})`,
    );
    return;
  }

  // Mock / dev fallback
  const delayMs = sms.delaySec * 1000;
  setTimeout(async () => {
    try {
      const result = await sendSms(sms.to, sms.body);
      if (result.success) {
        await logSmsEvent(sms.leadId, sms.clientId, {
          type: "initial",
          to: sms.to,
          body: sms.body,
          messageSid: result.messageSid,
        });
        console.log(
          `[SMS Workflow] Initial SMS sent to ${sms.to} (lead ${sms.leadId})`,
        );
      } else {
        console.error(
          `[SMS Workflow] Failed to send initial SMS to ${sms.to}: ${result.error}`,
        );
      }
    } catch (err) {
      console.error("[SMS Workflow] Unexpected error sending SMS:", err);
    }
  }, delayMs);
}

// ─── Event logging ───

async function logSmsEvent(
  leadId: string,
  clientId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (dbAvailable) {
    await prisma!.leadEvent.create({
      data: {
        leadId,
        clientId,
        eventType: "sms_sent",
        payload: payload as Record<string, string | undefined>,
      },
    });
  } else {
    mockDb.createEvent({
      leadId,
      clientId,
      eventType: "sms_sent",
      payload: payload as Record<string, string | undefined>,
    });
  }
}

// ─── Inbound reply handling ───

/**
 * Handle an inbound SMS reply from a lead.
 * Marks the lead as recovered and logs an sms_received event.
 * Returns the lead and client IDs if a match is found.
 */
export async function handleInboundSmsReply(
  fromPhone: string,
  toPhone: string,
  body: string,
  messageSid: string,
): Promise<{ matched: boolean; leadId?: string; clientId?: string }> {
  // Resolve client from the Twilio number they texted
  if (dbAvailable) {
    const normalised = toPhone.replace(/\D/g, "").slice(-10);
    const settings = await prisma!.clientSettings.findFirst({
      where: { trackedNumber: { contains: normalised } },
    });
    if (!settings) return { matched: false };

    const clientId = settings.clientId;

    // Find the most recent lead from this phone number
    const fromNormalised = fromPhone.replace(/\D/g, "").slice(-10);
    const lead = await prisma!.lead.findFirst({
      where: {
        clientId,
        phone: { contains: fromNormalised },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lead) return { matched: false };

    // Mark lead as recovered
    await prisma!.lead.update({
      where: { id: lead.id },
      data: {
        recovered: true,
        status: lead.status === "new" ? "contacted" : lead.status,
      },
    });

    // Log event
    await prisma!.leadEvent.create({
      data: {
        leadId: lead.id,
        clientId,
        eventType: "sms_received",
        payload: {
          from: fromPhone,
          to: toPhone,
          body,
          messageSid,
        },
      },
    });

    return { matched: true, leadId: lead.id, clientId };
  }

  // Mock fallback
  const mockClient = mockDb.findClientByTrackedNumber(toPhone);
  if (!mockClient) return { matched: false };

  const mockLead = mockDb.findLeadByPhoneAndClient(fromPhone, mockClient.id);
  if (!mockLead) return { matched: false };

  mockDb.updateLead(mockLead.id, {
    recovered: true,
    status: mockLead.status === "new" ? "contacted" : mockLead.status,
  });

  mockDb.createEvent({
    leadId: mockLead.id,
    clientId: mockClient.id,
    eventType: "sms_received",
    payload: { from: fromPhone, to: toPhone, body, messageSid },
  });

  return { matched: true, leadId: mockLead.id, clientId: mockClient.id };
}
