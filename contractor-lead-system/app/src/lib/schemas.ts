import { z } from "zod";

// ─── Client Settings ───

export const alertRecipientSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const officeHoursBlockSchema = z.object({
  open: z.string(), // "08:00"
  close: z.string(), // "17:00"
});

export const clientSettingsWriteSchema = z.object({
  trackedNumber: z.string().nullable().optional(),
  forwardingNumber: z.string().nullable().optional(),
  afterHoursNumber: z.string().nullable().optional(),
  callRecording: z.boolean().optional(),
  abandonedCallThresholdSec: z.number().int().min(5).max(120).optional(),
  alertRecipients: z.array(alertRecipientSchema).optional(),
  serviceAreas: z.array(z.string()).optional(),
  servicesOffered: z.array(z.string()).optional(),
  officeHours: z.record(z.string(), officeHoursBlockSchema).optional(),
  weekendHours: z.record(z.string(), officeHoursBlockSchema).optional(),
  qualificationQuestions: z.array(z.string()).optional(),
  disqualifierRules: z.array(z.string()).optional(),
  highPriorityRules: z.array(z.string()).optional(),
  smsTemplates: z.record(z.string(), z.string()).optional(),
  messageTiming: z.record(z.string(), z.number()).optional(),
  bookingMode: z.enum(["self_book", "manual_callback", "hybrid"]).optional(),
  bookingUrl: z.string().url().nullable().optional(),
  workflowEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  alertsEnabled: z.boolean().optional(),
});

export type ClientSettingsWrite = z.infer<typeof clientSettingsWriteSchema>;

// ─── Twilio Webhook ───

/** Shape of the payload Twilio POSTs to the call status webhook. */
export const twilioCallWebhookSchema = z.object({
  CallSid: z.string(),
  AccountSid: z.string(),
  From: z.string(),
  To: z.string(),
  CallStatus: z.string(), // ringing, in-progress, completed, busy, no-answer, canceled, failed
  Direction: z.string().optional(),
  CallerName: z.string().optional(),
  CallDuration: z.coerce.number().optional(), // seconds, present on completed
  Timestamp: z.string().optional(),
});

export type TwilioCallWebhook = z.infer<typeof twilioCallWebhookSchema>;

// ─── Call outcome classification ───

export type CallOutcome = "answered" | "missed" | "after_hours" | "abandoned";
