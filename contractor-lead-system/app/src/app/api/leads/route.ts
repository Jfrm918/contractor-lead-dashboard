import { prisma, dbAvailable } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { apiSuccess, apiError, apiServerError } from "@/lib/api-response";
import {
  leads as mockLeads,
  type Lead as MockLead,
} from "@/lib/data";
import type { NextRequest } from "next/server";

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return apiError("Not authenticated", 401);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const source = url.searchParams.get("source");
    const trade = url.searchParams.get("trade");
    const urgency = url.searchParams.get("urgency");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") ?? "recent";
    const limit = parseInt(url.searchParams.get("limit") ?? "100", 10);

    if (dbAvailable) {
      const isAdmin = session.role === "admin";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (!isAdmin && session.clientId) {
        where.clientId = session.clientId;
      }
      if (status) {
        where.status = status;
      }
      if (source) {
        where.source = source;
      }
      if (trade) {
        where.trade = trade;
      }
      if (urgency) {
        where.urgency = urgency;
      }
      if (search) {
        where.OR = [
          { callerName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ];
      }

      const leads = await prisma!.lead.findMany({
        where,
        orderBy: sort === "recent" ? { createdAt: "desc" } : { updatedAt: "desc" },
        take: limit,
        include: {
          events: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      // Transform to frontend shape
      const result = leads.map((l) => ({
        id: l.id,
        name: l.callerName ?? "Unknown",
        phone: l.phone,
        email: "",
        source: formatSource(l.source),
        trade: l.trade ?? "",
        service: l.serviceType ?? "",
        city: l.city ?? "",
        status: formatStatus(l.status),
        urgency: formatUrgency(l.urgency),
        lastContact: l.updatedAt.toISOString(),
        createdAt: l.createdAt.toISOString(),
        missedCall: l.missedCall,
        recovered: l.recovered,
        qualificationAnswers: Array.isArray(l.qualificationAnswers)
          ? l.qualificationAnswers
          : [],
        bookingIntent: "",
        conversation: [],
        clientId: l.clientId,
      }));

      return apiSuccess(result);
    }

    // Mock fallback — filter the hardcoded leads
    let filtered = [...mockLeads];

    if (status) {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (source) {
      filtered = filtered.filter((l) => l.source === source);
    }
    if (trade) {
      filtered = filtered.filter((l) => l.trade === trade);
    }
    if (urgency) {
      const urg = urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase();
      filtered = filtered.filter((l) => l.urgency === urg);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.service.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q),
      );
    }

    // Sort
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    filtered = filtered.slice(0, limit);

    return apiSuccess(filtered);
  } catch (err) {
    return apiServerError(err);
  }
}

// ─── Helpers ───

function formatSource(source: string | null): string {
  const map: Record<string, string> = {
    google_ads: "Google Ads",
    lsa: "LSA",
    organic: "Organic",
    referral: "Referral",
    direct_call: "Direct Call",
  };
  return source ? map[source] ?? source : "";
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    unqualified: "Unqualified",
    booking_requested: "Booking Requested",
    booked: "Booked",
    closed_lost: "Closed Lost",
  };
  return map[status] ?? status;
}

function formatUrgency(urgency: string | null): string {
  if (!urgency) return "Medium";
  const map: Record<string, string> = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[urgency] ?? urgency;
}
