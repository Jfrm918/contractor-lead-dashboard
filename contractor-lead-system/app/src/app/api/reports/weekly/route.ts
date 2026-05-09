/**
 * POST /api/reports/weekly
 *
 * Generates the Weekly Lost Lead Report for a client and sends it via SMS
 * to all alert recipients configured in their settings.
 *
 * Body: { clientId: string }
 */

import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";
import { sendSms, twilioConfigured } from "@/lib/twilio";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { z } from "zod";
import type { NextRequest } from "next/server";

const bodySchema = z.object({
  clientId: z.string().uuid(),
});

interface AlertRecipient {
  name: string;
  phone: string;
  email?: string;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("clientId (uuid) is required", 422);
    }

    if (!twilioConfigured()) {
      return apiError("Twilio is not configured — cannot send SMS", 503);
    }

    const { clientId } = parsed.data;

    // Gather data
    const reportData = await gatherReportData(clientId);
    if (!reportData) {
      return apiError("Client not found", 404);
    }

    // Build report text
    const report = buildReportText(reportData);

    // Get alert recipients
    const recipients = reportData.alertRecipients;
    if (!recipients || recipients.length === 0) {
      return apiError("No alert recipients configured for this client", 422);
    }

    // Send to each recipient
    const results: { phone: string; sent: boolean; error?: string }[] = [];
    for (const recipient of recipients) {
      if (!recipient.phone) continue;
      // Normalise phone
      const phone = recipient.phone.replace(/\D/g, "");
      const e164 = phone.length === 10 ? `+1${phone}` : `+${phone}`;

      const result = await sendSms(e164, report);
      results.push({
        phone: recipient.phone,
        sent: result.success,
        error: result.error,
      });

      // Log event if DB available
      if (dbAvailable && result.success) {
        // Find any lead for this client to attach the event (use most recent)
        const lead = await prisma!.lead.findFirst({
          where: { clientId },
          orderBy: { createdAt: "desc" },
        });
        if (lead) {
          await prisma!.leadEvent.create({
            data: {
              leadId: lead.id,
              clientId,
              eventType: "alert_sent",
              payload: {
                type: "weekly_report",
                recipient: recipient.name,
                phone: recipient.phone,
                messageSid: result.messageSid ?? null,
              },
            },
          });
        }
      }
    }

    const sentCount = results.filter((r) => r.sent).length;
    return apiSuccess({
      sent: sentCount,
      total: results.length,
      results,
    });
  } catch (err) {
    return apiServerError(err);
  }
}

// ─── Data gathering ───

interface ReportData {
  companyName: string;
  missedCalls: number;
  recovered: number;
  booked: number;
  unrecovered: number;
  protectedValue: number;
  atRiskValue: number;
  alertRecipients: AlertRecipient[];
}

async function gatherReportData(clientId: string): Promise<ReportData | null> {
  if (dbAvailable) {
    const client = await prisma!.client.findUnique({
      where: { id: clientId },
      include: { settings: true },
    });
    if (!client) return null;

    const [missedCount, recoveredCount, bookedCount] = await Promise.all([
      prisma!.lead.count({ where: { clientId, missedCall: true } }),
      prisma!.lead.count({ where: { clientId, recovered: true } }),
      prisma!.lead.count({ where: { clientId, status: "booked" } }),
    ]);

    const unrecovered = Math.max(missedCount - recoveredCount, 0);
    const jobValue = 3500; // fallback
    const closeRate = 0.35;
    const recoveredToBooked = recoveredCount > 0 ? bookedCount / recoveredCount : 0;
    const protectedValue = bookedCount * jobValue * closeRate;
    const atRiskValue = unrecovered * recoveredToBooked * jobValue * closeRate;

    const recipients = Array.isArray(client.settings?.alertRecipients)
      ? (client.settings.alertRecipients as unknown as AlertRecipient[])
      : [];

    return {
      companyName: client.companyName,
      missedCalls: missedCount,
      recovered: recoveredCount,
      booked: bookedCount,
      unrecovered,
      protectedValue,
      atRiskValue,
      alertRecipients: recipients,
    };
  }

  // Mock fallback
  const mockClient = mockDb.findClient(clientId);
  if (!mockClient) return null;
  const mockSettings = mockDb.findSettings(clientId);

  return {
    companyName: mockClient.companyName,
    missedCalls: 12,
    recovered: 8,
    booked: 5,
    unrecovered: 4,
    protectedValue: 6125,
    atRiskValue: 3063,
    alertRecipients: Array.isArray(mockSettings?.alertRecipients)
      ? (mockSettings.alertRecipients as AlertRecipient[])
      : [],
  };
}

// ─── Report formatter ───

function buildReportText(data: ReportData): string {
  const lines = [
    `Weekly Lost Lead Report — ${data.companyName}`,
    "",
    `Missed calls: ${data.missedCalls}`,
    `Recovered leads: ${data.recovered}`,
    `Unrecovered: ${data.unrecovered}`,
    `Booked estimates: ${data.booked}`,
    `Revenue protected: ${currency(data.protectedValue)}`,
    `Value at risk: ${currency(data.atRiskValue)}`,
    "",
    "Actions:",
    data.unrecovered > 0
      ? `1. Follow up on ${data.unrecovered} unrecovered lead${data.unrecovered === 1 ? "" : "s"} ASAP.`
      : "1. No unrecovered leads — keep it up.",
    `2. Review any open support tasks.`,
    `3. Keep response time under 2 min to beat market avg.`,
    "",
    "— Vantage",
  ];
  return lines.join("\n");
}
