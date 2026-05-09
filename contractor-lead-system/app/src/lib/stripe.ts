import Stripe from "stripe";
import { env } from "./env";

// ─── Stripe client singleton ───

function createStripeClient(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  STRIPE_SECRET_KEY not set — Stripe features disabled");
    return null;
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

const globalForStripe = globalThis as unknown as { stripe?: Stripe | null };
export const stripe = globalForStripe.stripe ?? createStripeClient();
if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;

export const stripeAvailable = stripe !== null;

// ─── Plan configuration ───

export const PLANS = {
  starter: {
    name: "Starter",
    price: 19700, // cents
    priceDisplay: "$197",
    features: [
      "Missed-call recovery",
      "SMS sequences",
      "Lead inbox & scoring",
      "Alerts",
      "Monthly scorecard",
      "Response audit",
      "Up to 200 leads/mo",
    ],
    leadLimit: 200,
  },
  growth: {
    name: "Growth",
    price: 34700,
    priceDisplay: "$347",
    features: [
      "Everything in Starter",
      "Unlimited leads",
      "Priority support",
      "Prospecting automation",
    ],
    leadLimit: Infinity,
  },
} as const;

export type PlanTier = keyof typeof PLANS;

// ─── Helpers ───

export async function createCheckoutSession(params: {
  clientId: string;
  clientEmail: string;
  companyName: string;
  planTier: PlanTier;
  stripeCustomerId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  if (!stripe) throw new Error("Stripe not configured");

  const plan = PLANS[params.planTier];

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer_email: params.stripeCustomerId ? undefined : params.clientEmail,
    customer: params.stripeCustomerId || undefined,
    metadata: {
      clientId: params.clientId,
      planTier: params.planTier,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Vantage ${plan.name} Plan`,
            description: plan.features.join(" · "),
          },
          unit_amount: plan.price,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  };

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
): Stripe.Event {
  if (!stripe) throw new Error("Stripe not configured");
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET not set");
  return stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
}

export function getPlanPrice(tier: string): number {
  return PLANS[tier as PlanTier]?.price ?? 0;
}

export function getPlanDisplayPrice(tier: string): string {
  return PLANS[tier as PlanTier]?.priceDisplay ?? "$0";
}
