import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { siteId } = await params;

  const site = await prisma.foamJobSite.findUnique({
    where: { id: siteId },
    include: {
      foamSystem: { select: { id: true, product: true, manufacturer: true, type: true, yieldPerSet: true } },
      dailyLogs: {
        include: {
          foamSystem: { select: { product: true } },
          user: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      },
      user: { select: { name: true } },
    },
  });

  if (!site) {
    return NextResponse.json(
      { success: false, error: { message: "Job site not found" } },
      { status: 404 }
    );
  }

  // Verify access
  if (session.role !== "admin" && site.companyId !== session.companyId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const totalSets = site.dailyLogs.reduce((s, l) => s + (l.setsUsed || 0), 0);
  const totalBF = site.dailyLogs.reduce((s, l) => s + (l.boardFeet || 0), 0);
  const totalSqft = site.dailyLogs.reduce((s, l) => s + (l.squareFeet || 0), 0);
  const daysWorked = site.dailyLogs.length;

  return NextResponse.json({
    success: true,
    data: { ...site, totalSets, totalBF, totalSqft, daysWorked },
  });
}

// Delete a job site. Daily logs (FoamJob records) are preserved — we
// just clear their jobSiteId so the historical production data stays
// queryable. The site itself is removed.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { siteId } = await params;

  const site = await prisma.foamJobSite.findUnique({
    where: { id: siteId },
    select: { id: true, companyId: true, userId: true },
  });
  if (!site) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && site.companyId !== session.companyId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  // Orphan any daily logs first so we don't violate the FK.
  await prisma.foamJob.updateMany({
    where: { jobSiteId: siteId },
    data: { jobSiteId: null },
  });

  await prisma.foamJobSite.delete({ where: { id: siteId } });
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { siteId } = await params;

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.address !== undefined) updateData.address = body.address || null;
    if (body.jobType !== undefined) updateData.jobType = body.jobType || null;
    if (body.substrate !== undefined) updateData.substrate = body.substrate || null;
    if (body.foamSystemId !== undefined) updateData.foamSystemId = body.foamSystemId || null;
    if (body.estimatedSets !== undefined) updateData.estimatedSets = body.estimatedSets ? parseFloat(body.estimatedSets) : null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.totalGallons !== undefined) updateData.totalGallons = body.totalGallons ? parseFloat(body.totalGallons) : null;
    updateData.updatedAt = new Date();

    const site = await prisma.foamJobSite.update({
      where: { id: siteId },
      data: updateData,
      include: {
        foamSystem: { select: { id: true, product: true, manufacturer: true, type: true, yieldPerSet: true } },
        dailyLogs: {
          select: { id: true, date: true, setsUsed: true, boardFeet: true, squareFeet: true, rating: true, problems: true, yieldActual: true },
          orderBy: { date: "desc" },
        },
      },
    });

    const totalSets = site.dailyLogs.reduce((s, l) => s + (l.setsUsed || 0), 0);
    const totalBF = site.dailyLogs.reduce((s, l) => s + (l.boardFeet || 0), 0);
    const totalSqft = site.dailyLogs.reduce((s, l) => s + (l.squareFeet || 0), 0);
    const daysWorked = site.dailyLogs.length;

    return NextResponse.json({
      success: true,
      data: { ...site, totalSets, totalBF, totalSqft, daysWorked },
    });
  } catch (err) {
    console.error("[UpdateJobSite]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update job site" } },
      { status: 500 }
    );
  }
}
