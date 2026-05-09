import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { leads as mockLeads, alerts as mockAlerts } from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/leads/:leadId
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ leadId: string }> },
) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);

    const { leadId } = await ctx.params;

    if (dbAvailable) {
      const lead = await prisma!.lead.findUnique({
        where: { id: leadId },
        include: {
          events: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!lead) return apiError("Lead not found", 404);

      // Verify access: admin can see all, client users can only see their own client's leads
      if (session.role !== "admin" && session.clientId && lead.clientId !== session.clientId) {
        return apiError("Not authorized", 403);
      }

      // Build conversation from events
      const conversation = lead.events
        .filter((e) =>
          ["sms_sent", "sms_received", "call_missed", "call_received", "call_answered"].includes(e.eventType),
        )
        .map((e) => {
          const payload = e.payload as Record<string, unknown>;
          let type: "system" | "outbound" | "inbound" = "system";
          if (e.eventType === "sms_sent") type = "outbound";
          else if (e.eventType === "sms_received") type = "inbound";
          else if (e.eventType === "call_missed") type = "system";
          else if (e.eventType === "call_answered") type = "inbound";

          return {
            type,
            content: (payload.message as string) ?? (payload.body as string) ?? eventDescription(e.eventType, payload),
            timestamp: e.createdAt.toISOString(),
          };
        });

      const result = {
        id: lead.id,
        name: lead.callerName ?? "Unknown",
        phone: lead.phone,
        email: "",
        source: formatSource(lead.source),
        trade: lead.trade ?? "",
        service: lead.serviceType ?? "",
        city: lead.city ?? "",
        status: formatStatus(lead.status),
        urgency: formatUrgency(lead.urgency),
        lastContact: lead.updatedAt.toISOString(),
        createdAt: lead.createdAt.toISOString(),
        missedCall: lead.missedCall,
        recovered: lead.recovered,
        qualificationAnswers: Array.isArray(lead.qualificationAnswers)
          ? lead.qualificationAnswers
          : [],
        bookingIntent: "",
        conversation,
        clientId: lead.clientId,
      };

      return apiSuccess(result);
    }

    // Mock fallback
    const lead = mockLeads.find((l) => l.id === leadId);
    if (!lead) return apiError("Lead not found", 404);

    const leadAlerts = mockAlerts.filter((a) => a.leadId === leadId);

    return apiSuccess({ ...lead, alerts: leadAlerts });
  } catch (err) {
    return apiServerError(err);
  }
}

function eventDescription(eventType: string, payload: Record<string, unknown>): string {
  switch (eventType) {
    case "call_missed":
      return `Missed call from ${payload.from ?? "unknown"}`;
    case "call_received":
      return `Call received from ${payload.from ?? "unknown"}`;
    case "call_answered":
      return `Call answered`;
    default:
      return eventType.replace(/_/g, " ");
  }
}

function formatSource(source: string | null): string {
  const map: Record<string, string> = {
    google_ads: "Google Ads",
    lsa: "LSA",
    organic: "Organic",
    referral: "Referral",
    direct_call: "Direct Call",
  };
  return source ? map[source] ?? source : "";
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    unqualified: "Unqualified",
    booking_requested: "Booking Requested",
    booked: "Booked",
    closed_lost: "Closed Lost",
  };
  return map[status] ?? status;
}

function formatUrgency(urgency: string | null): string {
  if (!urgency) return "Medium";
  const map: Record<string, string> = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[urgency] ?? urgency;
}
