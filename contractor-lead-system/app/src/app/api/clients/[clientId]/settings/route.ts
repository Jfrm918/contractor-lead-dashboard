import { prisma, dbAvailable } from "@/lib/db";
import { mockDb } from "@/lib/mock-db";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import { clientSettingsWriteSchema } from "@/lib/schemas";
import type { NextRequest } from "next/server";

// GET /api/clients/:clientId/settings
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/clients/[clientId]/settings">,
) {
  try {
    const { clientId } = await ctx.params;

    if (dbAvailable) {
      const settings = await prisma!.clientSettings.findUnique({
        where: { clientId },
      });
      if (!settings) return apiError("Settings not found", 404);
      return apiSuccess(settings);
    }

    // Mock fallback
    const settings = mockDb.findSettings(clientId);
    if (!settings) return apiError("Settings not found", 404);
    return apiSuccess(settings);
  } catch (err) {
    return apiServerError(err);
  }
}

// PUT /api/clients/:clientId/settings
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/clients/[clientId]/settings">,
) {
  try {
    const { clientId } = await ctx.params;
    const body = await req.json();

    const parsed = clientSettingsWriteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
        422,
      );
    }

    if (dbAvailable) {
      // Verify client exists
      const client = await prisma!.client.findUnique({ where: { id: clientId } });
      if (!client) return apiError("Client not found", 404);

      // Cast to satisfy Prisma's JSON field types (already Zod-validated)
      const dbData = parsed.data as Record<string, unknown>;
      const settings = await prisma!.clientSettings.upsert({
        where: { clientId },
        create: { clientId, ...dbData },
        update: dbData,
      });
      return apiSuccess(settings);
    }

    // Mock fallback
    const client = mockDb.findClient(clientId);
    if (!client) return apiError("Client not found", 404);
    const settings = mockDb.upsertSettings(clientId, parsed.data);
    return apiSuccess(settings);
  } catch (err) {
    return apiServerError(err);
  }
}
