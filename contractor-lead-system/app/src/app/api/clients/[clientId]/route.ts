import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { clientAccounts, supportTasks } from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/clients/:clientId
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ clientId: string }> },
) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);

    const { clientId } = await ctx.params;

    // Admin can see any client, client users can see their own
    if (session.role !== "admin" && session.clientId !== clientId) {
      return apiError("Not authorized", 403);
    }

    if (dbAvailable) {
      const client = await prisma!.client.findUnique({
        where: { id: clientId },
        include: {
          settings: true,
          _count: {
            select: { leads: true },
          },
        },
      });

      if (!client) return apiError("Client not found", 404);

      const [recoveredCount, bookedCount, recentEvents] = await Promise.all([
        prisma!.lead.count({ where: { clientId, recovered: true } }),
        prisma!.lead.count({ where: { clientId, status: "booked" } }),
        prisma!.leadEvent.findMany({
          where: { clientId },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            lead: { select: { callerName: true } },
          },
        }),
      ]);

      const result = {
        id: client.id,
        companyName: client.companyName,
        ownerName: client.contactName ?? "",
        trade: client.trade,
        city: "",
        serviceArea: Array.isArray(client.settings?.serviceAreas)
          ? (client.settings.serviceAreas as string[]).join(", ")
          : "",
        status: formatClientStatus(client.status),
        plan: formatPlanTier(client.planTier),
        workflowHealth: client.settings?.workflowEnabled ? "Healthy" : "Needs Attention",
        assignedNumber: client.settings?.trackedNumber ?? "",
        monthlyPrice: getPlanPrice(client.planTier),
        onboardingSteps: [] as { step: string; completed: boolean; completedDate?: string }[],
        totalLeads: client._count.leads,
        recoveredLeads: recoveredCount,
        bookedEstimates: bookedCount,
        openTasks: 0,
        lastActivity: client.updatedAt.toISOString(),
        recentEvents: recentEvents.map((e) => ({
          description: `${e.eventType.replace(/_/g, " ")} — ${e.lead.callerName ?? "Unknown"}`,
          timestamp: e.createdAt.toISOString(),
        })),
        openIssues: [] as string[],
        scriptNotes: "",
      };

      return apiSuccess(result);
    }

    // Mock fallback
    const client = clientAccounts.find((c) => c.id === clientId);
    if (!client) return apiError("Client not found", 404);

    const clientTasks = supportTasks.filter((t) => t.clientId === clientId);
    return apiSuccess({ ...client, tasks: clientTasks });
  } catch (err) {
    return apiServerError(err);
  }
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
