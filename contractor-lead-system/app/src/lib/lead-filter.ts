/**
 * Lead Filter — determines whether an inbound caller is a potential lead
 * before triggering the SMS recovery workflow.
 *
 * Two-stage approach:
 *   Stage 1: Check known callers DB (team, vendors, existing customers, spam)
 *   Stage 2: For unknown callers, send a neutral missed-call acknowledgment
 *            that lets the caller self-identify ("reply QUOTE")
 *
 * Only callers who reply get entered into the active lead pipeline.
 */

import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";

// ─── Types ───

export type CallerType =
  | "unknown"
  | "lead"
  | "team"
  | "vendor"
  | "existing_customer"
  | "spam"
  | "other";

export interface FilterResult {
  callerType: CallerType;
  shouldSendAck: boolean; // Should we send the neutral missed-call ack?
  shouldTriggerRecovery: boolean; // Should we trigger the full SMS recovery pipeline?
  reason: string;
}

export interface FilterContext {
  clientId: string;
  callerPhone: string;
  callerName?: string | null;
  source?: string | null; // google_ads, lsa, organic, etc.
  isFirstCall: boolean; // first time this number has called this client
}

// ─── Main filter ───

export async function classifyCaller(
  ctx: FilterContext,
): Promise<FilterResult> {
  const normalised = ctx.callerPhone.replace(/\D/g, "").slice(-10);

  // Stage 1: Check known callers list
  const knownType = await lookupKnownCaller(ctx.clientId, normalised);

  if (knownType) {
    // Known caller — don't send anything
    return {
      callerType: knownType,
      shouldSendAck: false,
      shouldTriggerRecovery: false,
      reason: `known_caller:${knownType}`,
    };
  }

  // Stage 2: Unknown caller — apply heuristics

  // If this call came through a tracked ad source, high confidence it's a lead
  // → trigger full recovery pipeline immediately
  if (isAdSourced(ctx.source)) {
    return {
      callerType: "lead",
      shouldSendAck: false,
      shouldTriggerRecovery: true,
      reason: "ad_sourced_call",
    };
  }

  // First-time unknown caller → send neutral acknowledgment
  // Repeat unknown caller (called before, never replied) → don't spam again
  if (ctx.isFirstCall) {
    return {
      callerType: "unknown",
      shouldSendAck: true,
      shouldTriggerRecovery: false,
      reason: "first_call_unknown",
    };
  }

  // Repeat caller who never engaged — don't text again
  return {
    callerType: "unknown",
    shouldSendAck: false,
    shouldTriggerRecovery: false,
    reason: "repeat_unknown_no_engagement",
  };
}

// ─── Known caller lookup ───

async function lookupKnownCaller(
  clientId: string,
  normalised: string,
): Promise<CallerType | null> {
  if (dbAvailable) {
    const record = await prisma!.knownCaller.findFirst({
      where: {
        clientId,
        phone: normalised,
      },
    });
    return (record?.type as CallerType) ?? null;
  }

  // Mock fallback
  return mockDb.findKnownCaller(clientId, normalised)?.type as CallerType ?? null;
}

// ─── Heuristics ───

const AD_SOURCES = new Set(["google_ads", "lsa", "yelp", "homeadvisor", "angi", "thumbtack"]);

function isAdSourced(source?: string | null): boolean {
  if (!source) return false;
  return AD_SOURCES.has(source);
}

// ─── Default ack template ───

export const DEFAULT_MISSED_CALL_ACK =
  "Sorry we missed your call! If you're looking for a quote or service, reply QUOTE and we'll get right back to you.";
