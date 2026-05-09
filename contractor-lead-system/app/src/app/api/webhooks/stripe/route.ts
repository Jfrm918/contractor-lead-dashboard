import { apiError, apiServerError } from "@/lib/api-response";
import { prisma, dbAvailable } from "@/lib/db";
import { constructWebhookEvent } from "@/lib/stripe";

// Stripe webhook event data types vary across API versions.
// We use minimal interfaces to avoid coupling to a specific SDK version.
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: Request) {
  try {
    if (!dbAvailable) {
      return apiError("Database not available", 503);
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return apiError("Missing stripe-signature header", 400);
    }

    let event: { type: string; data: { object: any } };
    try {
      event = constructWebhookEvent(body, signature) as any;
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return apiError("Invalid signature", 400);
    }

    const obj = event.data.object;

    switch (event.type) {
      case "checkout.session.completed": {
        const clientId = obj.metadata?.clientId as string | undefined;
        const planTier = obj.metadata?.planTier as string | undefined;
        if (!clientId || !planTier) break;

        await prisma!.subscription.upsert({
          where: { clientId },
          create: {
            clientId,
            stripeCustomerId: obj.customer as string,
            stripeSubscriptionId: obj.subscription as string,
            planTier,
            status: "active",
          },
          update: {
            stripeCustomerId: obj.customer as string,
            stripeSubscriptionId: obj.subscription as string,
            planTier,
            status: "active",
          },
        });

        await prisma!.client.update({
          where: { id: clientId },
          data: { planTier, status: "active" },
        });
        break;
      }

      case "invoice.paid": {
        const customerId = obj.customer as string;
        const subscription = await prisma!.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (subscription) {
          await prisma!.paymentHistory.create({
            data: {
              clientId: subscription.clientId,
              stripePaymentIntentId: (obj.payment_intent ?? null) as string | null,
              amount: obj.amount_paid as number,
              currency: obj.currency as string,
              status: "succeeded",
              paidAt: new Date(
                obj.status_transitions?.paid_at
                  ? (obj.status_transitions.paid_at as number) * 1000
                  : Date.now(),
              ),
              invoiceUrl: (obj.hosted_invoice_url ?? null) as string | null,
            },
          });

          const line = obj.lines?.data?.[0];
          if (line?.period) {
            await prisma!.subscription.update({
              where: { id: subscription.id },
              data: {
                status: "active",
                currentPeriodStart: line.period.start
                  ? new Date((line.period.start as number) * 1000)
                  : undefined,
                currentPeriodEnd: line.period.end
                  ? new Date((line.period.end as number) * 1000)
                  : undefined,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const customerId = obj.customer as string;
        const subscription = await prisma!.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (subscription) {
          await prisma!.paymentHistory.create({
            data: {
              clientId: subscription.clientId,
              stripePaymentIntentId: (obj.payment_intent ?? null) as string | null,
              amount: obj.amount_due as number,
              currency: obj.currency as string,
              status: "failed",
              invoiceUrl: (obj.hosted_invoice_url ?? null) as string | null,
            },
          });

          await prisma!.subscription.update({
            where: { id: subscription.id },
            data: { status: "past_due" },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const existing = await prisma!.subscription.findFirst({
          where: { stripeSubscriptionId: obj.id as string },
        });

        if (existing) {
          const periodStart = obj.current_period_start ?? obj.items?.data?.[0]?.current_period_start;
          const periodEnd = obj.current_period_end ?? obj.items?.data?.[0]?.current_period_end;

          await prisma!.subscription.update({
            where: { id: existing.id },
            data: {
              status: obj.status as string,
              cancelAtPeriodEnd: obj.cancel_at_period_end as boolean,
              ...(periodStart ? { currentPeriodStart: new Date((periodStart as number) * 1000) } : {}),
              ...(periodEnd ? { currentPeriodEnd: new Date((periodEnd as number) * 1000) } : {}),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const existing = await prisma!.subscription.findFirst({
          where: { stripeSubscriptionId: obj.id as string },
        });

        if (existing) {
          await prisma!.subscription.update({
            where: { id: existing.id },
            data: { status: "canceled", cancelAtPeriodEnd: false },
          });

          await prisma!.client.update({
            where: { id: existing.clientId },
            data: { status: "churned" },
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    return apiServerError(err);
  }
}
