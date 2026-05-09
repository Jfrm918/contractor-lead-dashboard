import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { prisma, dbAvailable } from "@/lib/db";
import { createPortalSession } from "@/lib/stripe";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);
    if (!session.clientId) return apiError("No client associated with account", 400);

    if (!dbAvailable) {
      return apiError("Database not available", 503);
    }

    const subscription = await prisma!.subscription.findUnique({
      where: { clientId: session.clientId },
    });

    if (!subscription) {
      return apiError("No subscription found. Please subscribe first.", 404);
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const portalSession = await createPortalSession(
      subscription.stripeCustomerId,
      origin,
    );

    return apiSuccess({ url: portalSession.url });
  } catch (err) {
    return apiServerError(err);
  }
}
