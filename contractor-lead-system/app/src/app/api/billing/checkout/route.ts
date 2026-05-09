import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma, dbAvailable } from "@/lib/db";
import { createCheckoutSession, PLANS, type PlanTier } from "@/lib/stripe";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);
    if (!session.clientId) return apiError("No client associated with account", 400);

    const body = await req.json();
    const planTier = body.planTier as PlanTier;

    if (!planTier || !PLANS[planTier]) {
      return apiError("Invalid plan tier. Must be starter, growth, or pro.", 400);
    }

    if (!dbAvailable) {
      return apiError("Database not available", 503);
    }

    const client = await prisma!.client.findUnique({
      where: { id: session.clientId },
      include: { subscription: true },
    });

    if (!client) return apiError("Client not found", 404);

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      clientId: client.id,
      clientEmail: client.contactEmail || session.email,
      companyName: client.companyName,
      planTier,
      stripeCustomerId: client.subscription?.stripeCustomerId,
      successUrl: `${origin}?billing=success`,
      cancelUrl: `${origin}?billing=canceled`,
    });

    return apiSuccess({ url: checkoutSession.url });
  } catch (err) {
    return apiServerError(err);
  }
}
