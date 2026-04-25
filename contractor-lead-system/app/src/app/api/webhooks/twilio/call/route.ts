import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import {
  twilioCallWebhookSchema,
  type CallOutcome,
} from "@/lib/schemas";

// POST /api/webhooks/twilio/call
// Twilio posts form-encoded data to this endpoint on each call event.
export async function POST(req: Request) {
  try {
    // Twilio sends application/x-www-form-urlencoded
    const contentType = req.headers.get("content-type") ?? "";
    let raw: Record<string, unknown>;
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      raw = Object.fromEntries(formData.entries());
    } else {
      raw = await req.json();
    }

    const parsed = twilioCallWebhookSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError(
        `Invalid Twilio payload: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
        422,
      );
    }

    const data = parsed.data;

    // ── 1. Resolve client from tracked number (the To number) ──
    const client = dbAvailable
      ? await resolveClientDb(data.To)
      : mockDb.findClientByTrackedNumber(data.To);

    if (!client) {
      console.warn(`[Twilio] No client found for tracked number: ${data.To}`);
      // Still return 200 so Twilio doesn't retry
      return apiSuccess({ received: true, matched: false });
    }

    // ── 2. Classify call outcome ──
    const outcome = classifyCallOutcome(data.CallStatus, data.CallDuration);

    // ── 3. Create or update lead ──
    const lead = dbAvailable
      ? await upsertLeadDb(client.id, data, outcome)
      : upsertLeadMock(client.id, data, outcome);

    // ── 4. Log event ──
    const eventType = `call_${outcome}`;
    if (dbAvailable) {
      await prisma!.leadEvent.create({
        data: {
          leadId: lead.id,
          clientId: client.id,
          eventType,
          payload: {
            callSid: data.CallSid,
            from: data.From,
            to: data.To,
            status: data.CallStatus,
            duration: data.CallDuration,
            outcome,
          },
        },
      });
    } else {
      mockDb.createEvent({
        leadId: lead.id,
        clientId: client.id,
        eventType,
        payload: {
          callSid: data.CallSid,
          from: data.From,
          to: data.To,
          status: data.CallStatus,
          duration: data.CallDuration,
          outcome,
        },
      });
    }

    return apiSuccess({
      received: true,
      matched: true,
      clientId: client.id,
      leadId: lead.id,
      outcome,
    });
  } catch (err) {
    return apiServerError(err);
  }
}

// ─── Helpers ───

function classifyCallOutcome(
  callStatus: string,
  duration?: number,
): CallOutcome {
  // Twilio terminal statuses:
  //   completed  — call was answered and ended normally
  //   busy       — called party was busy
  //   no-answer  — no one picked up
  //   canceled   — caller hung up before connect
  //   failed     — network/carrier failure

  if (callStatus === "completed" && duration !== undefined && duration > 0) {
    return "answered";
  }

  if (callStatus === "canceled" || (callStatus === "completed" && (duration ?? 0) === 0)) {
    // Very short / zero-duration completed calls are effectively abandoned
    return "abandoned";
  }

  if (callStatus === "no-answer" || callStatus === "busy" || callStatus === "failed") {
    return "missed";
  }

  // In-progress / ringing — treat as not-yet-resolved; log as missed for now
  // (a subsequent status callback will update if it completes)
  return "missed";
}

// ── Database helpers ──

async function resolveClientDb(toNumber: string) {
  const normalised = toNumber.replace(/\D/g, "").slice(-10);
  const settings = await prisma!.clientSettings.findFirst({
    where: {
      trackedNumber: { contains: normalised },
    },
    include: { client: true },
  });
  return settings?.client ?? null;
}

async function upsertLeadDb(
  clientId: string,
  data: { From: string; CallSid: string; CallerName?: string },
  outcome: CallOutcome,
) {
  const normalised = data.From.replace(/\D/g, "").slice(-10);

  // Look for an existing lead from the same phone for this client (last 24h)
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma!.lead.findFirst({
    where: {
      clientId,
      phone: { contains: normalised },
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return prisma!.lead.update({
      where: { id: existing.id },
      data: {
        callSid: data.CallSid,
        callOutcome: outcome,
        missedCall: outcome !== "answered",
      },
    });
  }

  return prisma!.lead.create({
    data: {
      clientId,
      phone: data.From,
      callerName: data.CallerName ?? null,
      callSid: data.CallSid,
      callOutcome: outcome,
      missedCall: outcome !== "answered",
      status: "new",
    },
  });
}

function upsertLeadMock(
  clientId: string,
  data: { From: string; CallSid: string; CallerName?: string },
  outcome: CallOutcome,
) {
  const existing = mockDb.findLeadByPhoneAndClient(data.From, clientId);
  if (existing) {
    return mockDb.updateLead(existing.id, {
      callSid: data.CallSid,
      callOutcome: outcome,
      missedCall: outcome !== "answered",
    })!;
  }
  return mockDb.createLead({
    clientId,
    phone: data.From,
    callerName: data.CallerName ?? null,
    source: "direct_call",
    trade: null,
    serviceType: null,
    city: null,
    urgency: null,
    qualificationState: "pending",
    qualificationAnswers: [],
    status: "new",
    missedCall: outcome !== "answered",
    recovered: false,
    callSid: data.CallSid,
    callOutcome: outcome,
  });
}
