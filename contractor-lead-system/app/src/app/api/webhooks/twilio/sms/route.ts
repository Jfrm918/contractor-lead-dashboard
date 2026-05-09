import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { handleInboundSmsReply } from "@/lib/sms-workflow";
import { validateTwilioSignature } from "@/lib/twilio-verify";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
import { z } from "zod";

/**
 * Inbound SMS webhook schema.
 * Twilio POSTs form-encoded data when a message is received on our number.
 */
const twilioSmsWebhookSchema = z.object({
  MessageSid: z.string(),
  AccountSid: z.string(),
  From: z.string(),
  To: z.string(),
  Body: z.string(),
});

// POST /api/webhooks/twilio/sms
export async function POST(req: Request) {
  try {
    // Rate limit: 60 requests per minute per IP
    const rl = checkRateLimit(getRequestIp(req), 60, 60_000);
    if (!rl.allowed) {
      return apiError("Rate limit exceeded", 429);
    }

    const contentType = req.headers.get("content-type") ?? "";
    let raw: Record<string, unknown>;
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      raw = Object.fromEntries(formData.entries());
    } else {
      raw = await req.json();
    }

    // Validate Twilio signature
    const validSignature = await validateTwilioSignature(req, raw);
    if (!validSignature) {
      console.warn("[Twilio SMS] Invalid signature — rejecting request");
      return apiError("Invalid Twilio signature", 403);
    }

    const parsed = twilioSmsWebhookSchema.safeParse(raw);
    if (!parsed.success) {
      return apiError(
        `Invalid Twilio SMS payload: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
        422,
      );
    }

    const data = parsed.data;

    const result = await handleInboundSmsReply(
      data.From,
      data.To,
      data.Body,
      data.MessageSid,
    );

    if (!result.matched) {
      console.warn(
        `[Twilio SMS] No matching lead for inbound SMS from ${data.From} to ${data.To}`,
      );
    }

    // Always return 200 so Twilio doesn't retry
    return apiSuccess({
      received: true,
      matched: result.matched,
      leadId: result.leadId ?? null,
      clientId: result.clientId ?? null,
    });
  } catch (err) {
    return apiServerError(err);
  }
}
