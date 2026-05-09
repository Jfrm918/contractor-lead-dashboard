import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { alerts as mockAlerts } from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/alerts
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);

    if (dbAvailable) {
      const isAdmin = session.role === "admin";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventWhere: any = {
        eventType: {
          in: [
            "call_missed",
            "alert_sent",
            "lead_qualified",
            "booking_requested",
          ],
        },
      };

      if (!isAdmin && session.clientId) {
        eventWhere.clientId = session.clientId;
      }

      const events = await prisma!.leadEvent.findMany({
        where: eventWhere,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          lead: {
            select: {
              id: true,
              callerName: true,
              urgency: true,
              status: true,
              serviceType: true,
              missedCall: true,
              recovered: true,
            },
          },
        },
      });

      const alerts = events.map((event) => {
        const payload = event.payload as Record<string, unknown>;
        const lead = event.lead;
        const alertType = mapEventToAlertType(event.eventType);

        return {
          id: event.id,
          type: alertType,
          leadId: event.leadId,
          contactName: lead.callerName ?? "Unknown",
          summary: (payload.summary as string) ?? buildAlertSummary(event.eventType, lead, payload),
          urgency: formatUrgency(lead.urgency),
          recommendation: (payload.recommendation as string) ?? buildRecommendation(event.eventType, lead),
          timestamp: event.createdAt.toISOString(),
          read: false, // Could be tracked per-user in a future iteration
        };
      });

      return apiSuccess(alerts);
    }

    // Mock fallback
    return apiSuccess(mockAlerts);
  } catch (err) {
    return apiServerError(err);
  }
}

function mapEventToAlertType(eventType: string): string {
  switch (eventType) {
    case "call_missed":
      return "follow_up";
    case "lead_qualified":
      return "hot_lead";
    case "booking_requested":
      return "estimate_requested";
    case "alert_sent":
      return "hot_lead";
    default:
      return "follow_up";
  }
}

function buildAlertSummary(
  eventType: string,
  lead: { callerName: string | null; serviceType: string | null; missedCall: boolean; recovered: boolean },
  payload: Record<string, unknown>,
): string {
  const name = lead.callerName ?? "Unknown caller";
  const service = lead.serviceType ?? "service inquiry";
  switch (eventType) {
    case "call_missed":
      return lead.recovered
        ? `Recovered missed call from ${name} — ${service}`
        : `Missed call from ${name} — ${service}, not yet recovered`;
    case "lead_qualified":
      return `Lead qualified — ${name} needs ${service}`;
    case "booking_requested":
      return `Booking requested — ${name} for ${service}`;
    default:
      return (payload.message as string) ?? `${eventType.replace(/_/g, " ")} — ${name}`;
  }
}

function buildRecommendation(
  eventType: string,
  lead: { urgency: string | null; recovered: boolean },
): string {
  switch (eventType) {
    case "call_missed":
      return lead.recovered
        ? "Lead has been contacted. Follow up to confirm booking."
        : "Call back within 30 minutes to recover this lead.";
    case "lead_qualified":
      return lead.urgency === "urgent"
        ? "High urgency — dispatch or call back immediately."
        : "Schedule an estimate at the customer's convenience.";
    case "booking_requested":
      return "Confirm the estimate time and send a reminder.";
    default:
      return "Review and take appropriate action.";
  }
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
