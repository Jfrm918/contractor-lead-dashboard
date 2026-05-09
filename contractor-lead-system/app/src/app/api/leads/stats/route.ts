import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { dashboardMetrics, funnelData, scorecardData } from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/leads/stats
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);

    if (dbAvailable) {
      const isAdmin = session.role === "admin";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (!isAdmin && session.clientId) {
        where.clientId = session.clientId;
      }

      const [
        totalLeads,
        missedCalls,
        recoveredLeads,
        qualifiedLeads,
        bookedEstimates,
        contactedLeads,
      ] = await Promise.all([
        prisma!.lead.count({ where }),
        prisma!.lead.count({ where: { ...where, missedCall: true } }),
        prisma!.lead.count({ where: { ...where, recovered: true } }),
        prisma!.lead.count({ where: { ...where, status: { in: ["qualified", "booking_requested", "booked"] } } }),
        prisma!.lead.count({ where: { ...where, status: "booked" } }),
        prisma!.lead.count({ where: { ...where, status: { not: "new" } } }),
      ]);

      // Compute avg response time from events
      let avgResponseTime = "N/A";
      try {
        const events = await prisma!.leadEvent.findMany({
          where: {
            ...((!isAdmin && session.clientId) ? { clientId: session.clientId } : {}),
            eventType: "sms_sent",
          },
          select: { leadId: true, createdAt: true },
          orderBy: { createdAt: "asc" },
          take: 100,
        });

        if (events.length > 0) {
          // Get the corresponding lead creation times
          const leadIds = [...new Set(events.map((e) => e.leadId))];
          const leads = await prisma!.lead.findMany({
            where: { id: { in: leadIds } },
            select: { id: true, createdAt: true },
          });
          const leadCreatedMap = new Map(leads.map((l) => [l.id, l.createdAt]));

          let totalSec = 0;
          let count = 0;
          const seen = new Set<string>();
          for (const event of events) {
            if (seen.has(event.leadId)) continue;
            seen.add(event.leadId);
            const created = leadCreatedMap.get(event.leadId);
            if (created) {
              totalSec += (event.createdAt.getTime() - created.getTime()) / 1000;
              count++;
            }
          }
          if (count > 0) {
            const avg = Math.round(totalSec / count);
            avgResponseTime = avg < 60 ? `${avg} sec` : `${Math.round(avg / 60)} min`;
          }
        }
      } catch {
        // Avg response time is optional
      }

      const metrics = {
        totalLeads,
        missedCalls,
        recoveredLeads,
        qualifiedLeads,
        estimatesBooked: bookedEstimates,
        avgResponseTime,
      };

      const funnel = {
        leadsIn: totalLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        booked: bookedEstimates,
      };

      // Build source breakdown
      const sourceGroups = await prisma!.lead.groupBy({
        by: ["source"],
        where,
        _count: true,
      });
      const sourceBooked = await prisma!.lead.groupBy({
        by: ["source"],
        where: { ...where, status: "booked" },
        _count: true,
      });
      const bookedMap = new Map(sourceBooked.map((s) => [s.source, s._count]));
      const sourceBreakdown = sourceGroups.map((s) => ({
        source: formatSource(s.source),
        leads: s._count,
        booked: bookedMap.get(s.source) ?? 0,
      }));

      // Monthly scorecard
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

      const monthWhere = { ...where, createdAt: { gte: monthStart } };
      const [
        monthTotal,
        monthMissed,
        monthRecovered,
        monthQualified,
        monthBooked,
      ] = await Promise.all([
        prisma!.lead.count({ where: monthWhere }),
        prisma!.lead.count({ where: { ...monthWhere, missedCall: true } }),
        prisma!.lead.count({ where: { ...monthWhere, recovered: true } }),
        prisma!.lead.count({ where: { ...monthWhere, status: { in: ["qualified", "booking_requested", "booked"] } } }),
        prisma!.lead.count({ where: { ...monthWhere, status: "booked" } }),
      ]);

      const recoveryRate = monthMissed > 0 ? Math.round((monthRecovered / monthMissed) * 100) : 0;

      const scorecard = {
        month: monthName,
        totalInbound: monthTotal,
        missedCalls: monthMissed,
        recoveredMissedCalls: monthRecovered,
        recoveryRate,
        qualifiedLeads: monthQualified,
        bookedEstimates: monthBooked,
        avgResponseTime,
        sourceBreakdown,
        roi: {
          adSpend: 0,
          estimatedRevenue: 0,
          costPerLead: 0,
          costPerBooking: 0,
          bookingRate: monthTotal > 0 ? Math.round((monthBooked / monthTotal) * 100) : 0,
        },
        weeklyTrend: [] as { week: string; leads: number; booked: number }[],
      };

      return apiSuccess({ metrics, funnel, scorecard });
    }

    // Mock fallback
    return apiSuccess({
      metrics: dashboardMetrics,
      funnel: funnelData,
      scorecard: scorecardData,
    });
  } catch (err) {
    return apiServerError(err);
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
