import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiError, apiServerError, apiSuccess } from "@/lib/api-response";
import { tulsaProspects } from "@/lib/tulsa-prospects";
import { z } from "zod";

const allowedRoles = new Set(["admin", "outreach"]);
const statuses = [
  "Not Contacted",
  "Email Sent",
  "Follow-Up 1",
  "Follow-Up 2",
  "Replied",
  "Demo Booked",
  "Pilot Offered",
  "Won",
  "Lost",
] as const;

const updateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(statuses).optional(),
  note: z.string().max(5000).optional(),
  lastContactedAt: z.string().datetime().nullable().optional(),
  followUpDueAt: z.string().datetime().nullable().optional(),
});

interface OutreachRow {
  name: string;
  trade: string;
  tier: string;
  fit_score: number;
  phone: string | null;
  email: string | null;
  email_confidence: string | null;
  website: string | null;
  contact_url: string | null;
  source: string | null;
  source_url: string | null;
  rating: string | null;
  zip: string | null;
  fit_reason: string;
  madison_angle: string;
  status: string;
  note: string;
  last_contacted_at: Date | null;
  follow_up_due_at: Date | null;
  last_touched_at: Date | null;
}

function canAccess(session: Awaited<ReturnType<typeof getSession>>) {
  return session && allowedRoles.has(session.role);
}

function serializeRow(row: OutreachRow) {
  return {
    name: row.name,
    trade: row.trade,
    tier: row.tier,
    fitScore: row.fit_score,
    phone: row.phone ?? "",
    email: row.email ?? "",
    emailConfidence: row.email_confidence ?? "",
    website: row.website ?? "",
    contactUrl: row.contact_url ?? "",
    source: row.source ?? "",
    sourceUrl: row.source_url ?? "",
    rating: row.rating ?? "",
    zip: row.zip ?? "",
    fitReason: row.fit_reason,
    madisonAngle: row.madison_angle,
    status: row.status,
    note: row.note ?? "",
    lastContactedAt: row.last_contacted_at?.toISOString() ?? null,
    followUpDueAt: row.follow_up_due_at?.toISOString() ?? null,
    lastTouchedAt: row.last_touched_at?.toISOString() ?? null,
  };
}

async function ensureSeeded() {
  if (!dbAvailable) return;
  const countRows = await prisma!.$queryRawUnsafe<{ count: string }[]>(
    `SELECT COUNT(*)::text AS count FROM outreach_prospects`,
  );
  if (Number(countRows[0]?.count ?? 0) > 0) return;

  for (const p of tulsaProspects) {
    await prisma!.$executeRawUnsafe(
      `INSERT INTO outreach_prospects
        (name, trade, tier, fit_score, phone, email, email_confidence, website, contact_url, source, source_url, rating, zip, fit_reason, madison_angle)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (name) DO NOTHING`,
      p.name,
      p.trade,
      p.tier,
      p.fitScore,
      p.phone || null,
      p.email || null,
      p.emailConfidence || null,
      p.website || null,
      p.contactUrl || null,
      p.source || null,
      p.sourceUrl || null,
      p.rating || null,
      p.zip || null,
      p.fitReason,
      p.madisonAngle,
    );
  }
}

// GET /api/outreach/prospects
export async function GET(req: Request) {
  try {
    const session = await getSession(req);

    // Public demo can read static data, but cannot mutate.
    if (!canAccess(session)) {
      return apiSuccess({
        prospects: tulsaProspects.map((p) => ({
          ...p,
          status: "Not Contacted",
          note: "",
          lastContactedAt: null,
          followUpDueAt: null,
          lastTouchedAt: null,
        })),
        mode: "demo",
      });
    }

    if (!dbAvailable) return apiError("Database unavailable", 503);
    await ensureSeeded();

    const rows = await prisma!.$queryRawUnsafe<OutreachRow[]>(
      `SELECT name, trade, tier, fit_score, phone, email, email_confidence, website, contact_url,
              source, source_url, rating, zip, fit_reason, madison_angle,
              status, note, last_contacted_at, follow_up_due_at, last_touched_at
       FROM outreach_prospects
       ORDER BY fit_score DESC, trade ASC, name ASC`,
    );

    return apiSuccess({ prospects: rows.map(serializeRow), mode: "live" });
  } catch (err) {
    return apiServerError(err);
  }
}

// PATCH /api/outreach/prospects
export async function PATCH(req: Request) {
  try {
    const session = await getSession(req);
    if (!canAccess(session)) return apiError("Not authorized", 401);
    if (!dbAvailable) return apiError("Database unavailable", 503);

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid prospect update", 422);

    await ensureSeeded();

    const data = parsed.data;
    const status = data.status ?? null;
    const note = data.note ?? null;
    const lastContactedAt = data.lastContactedAt ? new Date(data.lastContactedAt) : null;
    const followUpDueAt = data.followUpDueAt ? new Date(data.followUpDueAt) : null;

    const rows = await prisma!.$queryRawUnsafe<OutreachRow[]>(
      `UPDATE outreach_prospects
       SET status = COALESCE($2, status),
           note = COALESCE($3, note),
           last_contacted_at = CASE WHEN $4::text IS NULL THEN last_contacted_at ELSE $4::timestamp END,
           follow_up_due_at = CASE WHEN $5::text IS NULL THEN follow_up_due_at ELSE $5::timestamp END,
           last_touched_at = NOW(),
           updated_at = NOW()
       WHERE name = $1
       RETURNING name, trade, tier, fit_score, phone, email, email_confidence, website, contact_url,
                 source, source_url, rating, zip, fit_reason, madison_angle,
                 status, note, last_contacted_at, follow_up_due_at, last_touched_at`,
      data.name,
      status,
      note,
      data.lastContactedAt === null ? null : lastContactedAt,
      data.followUpDueAt === null ? null : followUpDueAt,
    );

    if (!rows[0]) return apiError("Prospect not found", 404);
    return apiSuccess({ prospect: serializeRow(rows[0]) });
  } catch (err) {
    return apiServerError(err);
  }
}
