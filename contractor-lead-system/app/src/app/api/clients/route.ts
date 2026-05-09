import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { clientAccounts, adminMetrics, supportTasks, operatorActions } from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/clients — Admin only
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);
    if (session.role !== "admin") return apiError("Admin access required", 403);

    if (dbAvailable) {
      const clients = await prisma!.client.findMany({
        include: {
          settings: true,
          _count: {
            select: { leads: true },
          },
        },
        orderBy: { companyName: "asc" },
      });

      // Get lead stats per client
      const clientIds = clients.map((c) => c.id);

      const [missedCounts, recoveredCounts, bookedCounts] = await Promise.all([
        prisma!.lead.groupBy({
          by: ["clientId"],
          where: { clientId: { in: clientIds }, missedCall: true },
          _count: true,
        }),
        prisma!.lead.groupBy({
          by: ["clientId"],
          where: { clientId: { in: clientIds }, recovered: true },
          _count: true,
        }),
        prisma!.lead.groupBy({
          by: ["clientId"],
          where: { clientId: { in: clientIds }, status: "booked" },
          _count: true,
        }),
      ]);

      const missedMap = new Map(missedCounts.map((m) => [m.clientId, m._count]));
      const recoveredMap = new Map(recoveredCounts.map((r) => [r.clientId, r._count]));
      const bookedMap = new Map(bookedCounts.map((b) => [b.clientId, b._count]));

      const clientList = clients.map((c) => {
        const recoveredLeads = recoveredMap.get(c.id) ?? 0;
        const bookedEstimates = bookedMap.get(c.id) ?? 0;
        const closeRatePct = recoveredLeads > 0 ? Math.round((bookedEstimates / recoveredLeads) * 100) : getTradeCloseRate(c.trade);

        return ({
        id: c.id,
        companyName: c.companyName,
        ownerName: c.contactName ?? "",
        trade: c.trade,
        city: "",
        serviceArea: Array.isArray(c.settings?.serviceAreas)
          ? (c.settings.serviceAreas as string[]).join(", ")
          : "",
        status: formatClientStatus(c.status),
        plan: formatPlanTier(c.planTier),
        workflowHealth: c.settings?.workflowEnabled ? "Healthy" : "Needs Attention",
        assignedNumber: c.settings?.trackedNumber ?? "",
        monthlyPrice: getPlanPrice(c.planTier),
        onboardingSteps: [] as { step: string; completed: boolean; completedDate?: string }[],
        totalLeads: c._count.leads,
        missedCalls: missedMap.get(c.id) ?? 0,
        recoveredLeads,
        bookedEstimates,
        avgBookedJobValue: getTradeAvgJobValue(c.trade),
        closeRatePct,
        openTasks: 0,
        lastActivity: c.updatedAt.toISOString(),
        recentEvents: [] as { description: string; timestamp: string }[],
        openIssues: [] as string[],
        scriptNotes: "",
        });
      });

      // Build admin metrics
      const totalLeadsAll = clientList.reduce((s, c) => s + c.totalLeads, 0);
      const recoveredAll = clientList.reduce((s, c) => s + c.recoveredLeads, 0);
      const bookedAll = clientList.reduce((s, c) => s + c.bookedEstimates, 0);

      const metrics = {
        totalClients: clients.length,
        activeClients: clients.filter((c) => c.status === "active").length,
        trialClients: clients.filter((c) => c.status === "trial").length,
        pausedClients: clients.filter((c) => c.status === "paused").length,
        onboardingClients: clients.filter((c) => c.status === "onboarding").length,
        totalLeadsAllClients: totalLeadsAll,
        recoveredLeadsAllClients: recoveredAll,
        bookedEstimatesAllClients: bookedAll,
        workflowsNeedingAttention: clientList.filter((c) => c.workflowHealth !== "Healthy").length,
        openSupportTasks: 0,
      };

      return apiSuccess({ clients: clientList, metrics, supportTasks: [], operatorActions: [] });
    }

    // Mock fallback
    return apiSuccess({
      clients: clientAccounts,
      metrics: adminMetrics,
      supportTasks,
      operatorActions,
    });
  } catch (err) {
    return apiServerError(err);
  }
}

function getTradeAvgJobValue(trade: string): number {
  const map: Record<string, number> = {
    HVAC: 6500,
    Plumbing: 4200,
    Roofing: 11500,
    Electrical: 2800,
    Insulation: 5000,
  };
  return map[trade] ?? 3500;
}

function getTradeCloseRate(trade: string): number {
  const map: Record<string, number> = {
    HVAC: 38,
    Plumbing: 42,
    Roofing: 30,
    Electrical: 35,
    Insulation: 32,
  };
  return map[trade] ?? 35;
}

function formatClientStatus(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    trial: "Trial",
    paused: "Paused",
    onboarding: "Onboarding",
    churned: "Churned",
  };
  return map[status] ?? status;
}

function formatPlanTier(tier: string): string {
  const map: Record<string, string> = {
    starter: "Starter",
    growth: "Growth",
    pro: "Pro",
  };
  return map[tier] ?? tier;
}

function getPlanPrice(tier: string): number {
  const map: Record<string, number> = {
    starter: 299,
    growth: 499,
    pro: 799,
  };
  return map[tier] ?? 0;
}
