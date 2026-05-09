/**
 * GET  /api/clients/:clientId/audit  — load competitor audit rows
 * PUT  /api/clients/:clientId/audit  — save competitor audit rows
 *
 * Rows are stored as a JSON array in client_settings.competitor_audit_rows.
 */

import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { z } from "zod";
import type { NextRequest } from "next/server";

const auditRowSchema = z.object({
  id: z.string(),
  competitor: z.string(),
  testedAt: z.string(),
  responseMinutes: z.number().int().min(0),
  channel: z.enum(["call", "text", "email", "none"]),
  quality: z.enum(["weak", "average", "strong"]),
  notes: z.string(),
});

const auditRowsSchema = z.array(auditRowSchema);

// GET /api/clients/:clientId/audit
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/clients/[clientId]/audit">,
) {
  try {
    const { clientId } = await ctx.params;

    if (dbAvailable) {
      const settings = await prisma!.clientSettings.findUnique({
        where: { clientId },
        select: { competitorAuditRows: true },
      });
      if (!settings) return apiSuccess({ rows: [] });
      return apiSuccess({ rows: settings.competitorAuditRows ?? [] });
    }

    // Mock fallback — competitor audit not persisted in mock mode
    const settings = mockDb.findSettings(clientId);
    if (!settings) return apiSuccess({ rows: [] });
    return apiSuccess({ rows: (settings as unknown as Record<string, unknown>).competitorAuditRows ?? [] });
  } catch (err) {
    return apiServerError(err);
  }
}

// PUT /api/clients/:clientId/audit
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/clients/[clientId]/audit">,
) {
  try {
    const { clientId } = await ctx.params;
    const body = await req.json();

    const parsed = auditRowsSchema.safeParse(body.rows ?? body);
    if (!parsed.success) {
      return apiError(
        `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        422,
      );
    }

    if (dbAvailable) {
      const client = await prisma!.client.findUnique({ where: { id: clientId } });
      if (!client) return apiError("Client not found", 404);

      await prisma!.clientSettings.upsert({
        where: { clientId },
        create: { clientId, competitorAuditRows: parsed.data },
        update: { competitorAuditRows: parsed.data },
      });
      return apiSuccess({ rows: parsed.data });
    }

    // Mock fallback — store in-memory on the mock settings object
    const settings = mockDb.findSettings(clientId);
    if (settings) {
      (settings as unknown as Record<string, unknown>).competitorAuditRows = parsed.data;
    }
    return apiSuccess({ rows: parsed.data });
  } catch (err) {
    return apiServerError(err);
  }
}
