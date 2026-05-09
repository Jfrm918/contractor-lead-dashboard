import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma, dbAvailable } from "@/lib/db";
import { PLANS, type PlanTier } from "@/lib/stripe";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);
    if (!session.clientId) return apiError("No client associated with account", 400);

    if (!dbAvailable) {
      // Return mock billing status for demo mode
      return apiSuccess({
        subscription: null,
        plan: PLANS.starter,
        planTier: "starter",
        recentPayments: [],
      });
    }

    const [subscription, recentPayments, client] = await Promise.all([
      prisma!.subscription.findUnique({
        where: { clientId: session.clientId },
      }),
      prisma!.paymentHistory.findMany({
        where: { clientId: session.clientId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma!.client.findUnique({
        where: { id: session.clientId },
        select: { planTier: true },
      }),
    ]);

    const planTier = (subscription?.planTier || client?.planTier || "starter") as PlanTier;

    return apiSuccess({
      subscription: subscription
        ? {
            id: subscription.id,
            planTier: subscription.planTier,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      plan: PLANS[planTier] || PLANS.starter,
      planTier,
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        paidAt: p.paidAt,
        invoiceUrl: p.invoiceUrl,
      })),
    });
  } catch (err) {
    return apiServerError(err);
  }
}
