/**
 * GET /api/cron/process-sms-jobs
 *
 * Cron endpoint called by Vercel every 2 minutes (see vercel.json).
 * Picks up pending SmsJob rows where scheduledAt <= now, sends each SMS,
 * and marks them processed or failed.
 *
 * Protected by CRON_SECRET in production — Vercel passes this automatically
 * as the Authorization: Bearer header when invoking cron routes.
 */

import { type NextRequest } from "next/server";
import { prisma, dbAvailable } from "@/lib/db";
import { sendSms, twilioConfigured } from "@/lib/twilio";
import { apiSuccess, apiError } from "@/lib/api-response";
import { env } from "@/lib/env";

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 20;

export async function GET(req: NextRequest) {
  // Verify cron secret in production
  if (env.NODE_ENV === "production") {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return apiError("Unauthorized", 401);
    }
  }

  if (!dbAvailable) {
    return apiSuccess({ processed: 0, sent: 0, failed: 0, note: "mock mode — no-op" });
  }

  if (!twilioConfigured()) {
    return apiSuccess({ processed: 0, sent: 0, failed: 0, note: "twilio not configured" });
  }

  const now = new Date();

  // Fetch pending jobs: due, not yet processed, not permanently failed, under retry cap
  const pending = await prisma!.smsJob.findMany({
    where: {
      scheduledAt: { lte: now },
      processedAt: null,
      failedAt: null,
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH_SIZE,
  });

  let sent = 0;
  let failed = 0;

  for (const job of pending) {
    // Increment attempt count first to prevent duplicate sends on concurrent runs
    const updated = await prisma!.smsJob.update({
      where: { id: job.id },
      data: { attempts: { increment: 1 } },
    });

    try {
      const result = await sendSms(job.toPhone, job.body);

      if (result.success) {
        await prisma!.smsJob.update({
          where: { id: job.id },
          data: { processedAt: new Date() },
        });
        await prisma!.leadEvent.create({
          data: {
            leadId: job.leadId,
            clientId: job.clientId,
            eventType: "sms_sent",
            payload: {
              type: "initial",
              to: job.toPhone,
              body: job.body,
              messageSid: result.messageSid ?? null,
            },
          },
        });
        console.log(`[Cron SMS] Sent to ${job.toPhone} (lead ${job.leadId})`);
        sent++;
      } else {
        const exhausted = updated.attempts >= MAX_ATTEMPTS;
        if (exhausted) {
          await prisma!.smsJob.update({
            where: { id: job.id },
            data: { failedAt: new Date(), failReason: result.error ?? "send_failed" },
          });
          console.error(`[Cron SMS] Permanently failed (lead ${job.leadId}): ${result.error}`);
        } else {
          console.warn(`[Cron SMS] Send failed attempt ${updated.attempts}/${MAX_ATTEMPTS} (lead ${job.leadId}): ${result.error}`);
        }
        failed++;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "unknown error";
      const exhausted = updated.attempts >= MAX_ATTEMPTS;
      if (exhausted) {
        await prisma!.smsJob.update({
          where: { id: job.id },
          data: { failedAt: new Date(), failReason: errMsg },
        });
      }
      console.error(`[Cron SMS] Exception for job ${job.id}: ${errMsg}`);
      failed++;
    }
  }

  return apiSuccess({ processed: pending.length, sent, failed });
}
