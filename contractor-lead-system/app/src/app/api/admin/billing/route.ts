import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma, dbAvailable } from "@/lib/db";
import { PLANS, type PlanTier } from "@/lib/stripe";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);
    if (session.role !== "admin") return apiError("Admin access required", 403);

    if (!dbAvailable) {
      return apiSuccess({
        metrics: { mrr: 0, activeSubscribers: 0, churnRate: 0, arpc: 0, outstandingAmount: 0, totalClients: 0 },
        subscribers: [],
        recentPayments: [],
        dueSoon: [],
        churnWatch: [],
      });
    }

    const [subscriptions, recentPayments, clientCount] = await Promise.all([
      prisma!.subscription.findMany({
        include: {
          client: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              trade: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma!.paymentHistory.findMany({
        include: {
          client: {
            select: { companyName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma!.client.count(),
    ]);

    // Calculate metrics
    const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trialing");
    const mrr = activeSubs.reduce((sum, s) => {
      const plan = PLANS[s.planTier as PlanTier];
      return sum + (plan?.price ?? 0);
    }, 0);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const canceledRecent = subscriptions.filter(
      (s) => s.status === "canceled" && s.updatedAt >= thirtyDaysAgo,
    );
    const totalActivePlusCanceled = activeSubs.length + canceledRecent.length;
    const churnRate = totalActivePlusCanceled > 0
      ? Math.round((canceledRecent.length / totalActivePlusCanceled) * 100)
      : 0;

    const arpc = activeSubs.length > 0 ? Math.round(mrr / activeSubs.length) : 0;

    const pastDueSubs = subscriptions.filter((s) => s.status === "past_due");
    const outstandingAmount = pastDueSubs.reduce((sum, s) => {
      const plan = PLANS[s.planTier as PlanTier];
      return sum + (plan?.price ?? 0);
    }, 0);

    // Who's due in next 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dueSoon = subscriptions.filter(
      (s) =>
        s.status === "active" &&
        s.currentPeriodEnd &&
        s.currentPeriodEnd <= sevenDaysFromNow &&
        s.currentPeriodEnd >= now,
    );

    // Churn watch — canceling or canceled
    const churnWatch = subscriptions.filter(
      (s) => s.cancelAtPeriodEnd || s.status === "canceled",
    );

    // Get lead counts per client for plan limit tracking
    const clientIds = activeSubs.map((s) => s.clientId);
    const leadCounts = clientIds.length > 0
      ? await prisma!.lead.groupBy({
          by: ["clientId"],
          where: {
            clientId: { in: clientIds },
            createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
          },
          _count: true,
        })
      : [];
    const leadCountMap = new Map(leadCounts.map((l) => [l.clientId, l._count]));

    return apiSuccess({
      metrics: {
        mrr,
        activeSubscribers: activeSubs.length,
        churnRate,
        arpc,
        outstandingAmount,
        totalClients: clientCount,
      },
      subscribers: subscriptions.map((s) => {
        const plan = PLANS[s.planTier as PlanTier];
        return {
          id: s.id,
          clientId: s.clientId,
          companyName: s.client.companyName,
          contactName: s.client.contactName,
          trade: s.client.trade,
          planTier: s.planTier,
          status: s.status,
          mrrContribution: plan?.price ?? 0,
          currentPeriodEnd: s.currentPeriodEnd,
          cancelAtPeriodEnd: s.cancelAtPeriodEnd,
          leadCount: leadCountMap.get(s.clientId) ?? 0,
          leadLimit: plan?.leadLimit ?? 0,
        };
      }),
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        companyName: p.client.companyName,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      dueSoon: dueSoon.map((s) => ({
        clientId: s.clientId,
        companyName: s.client.companyName,
        planTier: s.planTier,
        dueDate: s.currentPeriodEnd,
      })),
      churnWatch: churnWatch.map((s) => ({
        clientId: s.clientId,
        companyName: s.client.companyName,
        planTier: s.planTier,
        status: s.status,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        periodEnd: s.currentPeriodEnd,
      })),
    });
  } catch (err) {
    return apiServerError(err);
  }
}

