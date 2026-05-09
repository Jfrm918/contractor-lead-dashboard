import { prisma, dbAvailable } from "@/lib/db";
import { verifyTwilioCredentials, twilioConfigured } from "@/lib/twilio";
import { apiSuccess, apiServerError } from "@/lib/api-response";

export type HealthStatus = "healthy" | "degraded" | "down";

export interface SystemHealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
}

export interface HealthResponse {
  overall: HealthStatus;
  checks: SystemHealthCheck[];
  checkedAt: string;
}

// GET /api/admin/health
export async function GET() {
  try {
    const checks = await Promise.all([
      checkDatabase(),
      checkTwilioApi(),
      checkSmsWorkflow(),
      checkWebhookActivity(),
    ]);

    // Overall status: worst of all checks
    let overall: HealthStatus = "healthy";
    for (const check of checks) {
      if (check.status === "down") {
        overall = "down";
        break;
      }
      if (check.status === "degraded") {
        overall = "degraded";
      }
    }

    const response: HealthResponse = {
      overall,
      checks,
      checkedAt: new Date().toISOString(),
    };

    return apiSuccess(response);
  } catch (err) {
    return apiServerError(err);
  }
}

// ─── Individual checks ───

async function checkDatabase(): Promise<SystemHealthCheck> {
  if (!dbAvailable) {
    return {
      name: "Database",
      status: "degraded",
      message: "Running in mock-data mode (no DATABASE_URL)",
    };
  }

  const start = performance.now();
  try {
    await prisma!.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);
    return {
      name: "Database",
      status: "healthy",
      message: `Connected (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      name: "Database",
      status: "down",
      message: err instanceof Error ? err.message : "Connection failed",
      latencyMs,
    };
  }
}

async function checkTwilioApi(): Promise<SystemHealthCheck> {
  if (!twilioConfigured()) {
    return {
      name: "Twilio API",
      status: "degraded",
      message: "Twilio environment variables not configured",
    };
  }

  const start = performance.now();
  const valid = await verifyTwilioCredentials();
  const latencyMs = Math.round(performance.now() - start);

  return {
    name: "Twilio API",
    status: valid ? "healthy" : "down",
    message: valid
      ? `Credentials valid (${latencyMs}ms)`
      : "Invalid credentials or API unreachable",
    latencyMs,
  };
}

async function checkSmsWorkflow(): Promise<SystemHealthCheck> {
  if (!dbAvailable) {
    // In mock mode, check mock settings
    // Import here to avoid circular deps at module level
    const { mockDb } = await import("@/lib/mock-db");
    const s1 = mockDb.findSettings("00000000-0000-0000-0000-000000000001");
    const s2 = mockDb.findSettings("00000000-0000-0000-0000-000000000002");
    const enabled = [s1, s2].filter((s) => s?.smsEnabled).length;
    return {
      name: "SMS Workflow",
      status: enabled > 0 ? "healthy" : "down",
      message: `${enabled} client(s) with SMS enabled (mock mode)`,
    };
  }

  try {
    const enabledCount = await prisma!.clientSettings.count({
      where: { smsEnabled: true },
    });

    if (enabledCount === 0) {
      return {
        name: "SMS Workflow",
        status: "down",
        message: "No clients have SMS enabled",
      };
    }

    return {
      name: "SMS Workflow",
      status: "healthy",
      message: `${enabledCount} client(s) with SMS enabled`,
    };
  } catch (err) {
    return {
      name: "SMS Workflow",
      status: "down",
      message: err instanceof Error ? err.message : "Query failed",
    };
  }
}

async function checkWebhookActivity(): Promise<SystemHealthCheck> {
  if (!dbAvailable) {
    return {
      name: "Webhook Activity",
      status: "degraded",
      message: "Cannot check activity in mock mode",
    };
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCallEvents = await prisma!.leadEvent.count({
      where: {
        eventType: { startsWith: "call_" },
        createdAt: { gte: cutoff },
      },
    });

    if (recentCallEvents === 0) {
      return {
        name: "Webhook Activity",
        status: "degraded",
        message: "No webhook calls in the last 24 hours",
      };
    }

    return {
      name: "Webhook Activity",
      status: "healthy",
      message: `${recentCallEvents} call event(s) in the last 24h`,
    };
  } catch (err) {
    return {
      name: "Webhook Activity",
      status: "down",
      message: err instanceof Error ? err.message : "Query failed",
    };
  }
}
