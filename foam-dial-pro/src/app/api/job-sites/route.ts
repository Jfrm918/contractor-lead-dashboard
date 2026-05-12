import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // in_progress, complete, on_hold

  const where: Record<string, unknown> = session.role === "admin"
    ? {}
    : { companyId: session.companyId, userId: session.userId };

  if (status) {
    where.status = status;
  }

  const sites = await prisma.foamJobSite.findMany({
    where,
    include: {
      foamSystem: { select: { id: true, product: true, manufacturer: true, type: true, yieldPerSet: true } },
      dailyLogs: {
        select: { id: true, date: true, setsUsed: true, boardFeet: true, squareFeet: true, rating: true, problems: true, yieldActual: true },
        orderBy: { date: "desc" },
      },
      user: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Enrich with computed stats
  const enriched = sites.map((site) => {
    const totalSets = site.dailyLogs.reduce((s, l) => s + (l.setsUsed || 0), 0);
    const totalBF = site.dailyLogs.reduce((s, l) => s + (l.boardFeet || 0), 0);
    const totalSqft = site.dailyLogs.reduce((s, l) => s + (l.squareFeet || 0), 0);
    const daysWorked = site.dailyLogs.length;
    return {
      ...site,
      totalSets,
      totalBF,
      totalSqft,
      daysWorked,
    };
  });

  return NextResponse.json({ success: true, data: enriched });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const body = await request.json();

    const site = await prisma.foamJobSite.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        name: body.name,
        address: body.address || null,
        jobType: body.jobType || null,
        substrate: body.substrate || null,
        foamSystemId: body.foamSystemId || null,
        estimatedSets: body.estimatedSets ? parseFloat(body.estimatedSets) : null,
        status: "in_progress",
        notes: body.notes || null,
      },
      include: {
        foamSystem: { select: { id: true, product: true, manufacturer: true, type: true, yieldPerSet: true } },
      },
    });

    return NextResponse.json({ success: true, data: site });
  } catch (err) {
    console.error("[CreateJobSite]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create job site" } },
      { status: 500 }
    );
  }
}
