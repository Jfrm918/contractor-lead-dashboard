import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateDewPoint, calculateYield } from '@/lib/foam-calc';

type Params = { params: Promise<{ jobId: string }> };

// Fetch one job (with events). Used by the EOD-resume flow on the dashboard.
export async function GET(request: Request, ctx: Params) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { jobId } = await ctx.params;

  const job = await prisma.foamJob.findUnique({
    where: { id: jobId },
    include: {
      foamSystem: true,
      jobSite: true,
      events: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!job) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && job.userId !== session.userId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  return NextResponse.json({ success: true, data: job });
}

// PATCH a job — used for closing out an in-progress job (EOD finish) or
// updating any field on a legacy single-shot job.
export async function PATCH(request: Request, ctx: Params) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { jobId } = await ctx.params;

  const existing = await prisma.foamJob.findUnique({ where: { id: jobId } });
  if (!existing) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && existing.userId !== session.userId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const body = await request.json();
    const finish = body.phase === 'complete' || body.finish === true;

    // Recompute dew point if we got fresh ambient/humidity
    let dewPoint = existing.dewPoint;
    const amb = body.ambientTemp != null ? parseFloat(body.ambientTemp) : null;
    const hum = body.humidity != null ? parseFloat(body.humidity) : null;
    if (amb != null && hum != null) {
      dewPoint = calculateDewPoint(amb, hum);
    }

    // Recompute yield if production fields changed
    let yieldTarget = existing.yieldTarget;
    if (body.foamSystemId && body.foamSystemId !== existing.foamSystemId) {
      const foam = await prisma.foamSystem.findUnique({ where: { id: body.foamSystemId } });
      if (foam) yieldTarget = foam.yieldPerSet;
    }
    const setsUsed = body.setsUsed ? parseFloat(body.setsUsed) : existing.setsUsed;
    const boardFeet = body.boardFeet != null ? parseFloat(body.boardFeet) : existing.boardFeet;
    const { yieldActual, yieldVariance } = calculateYield({
      boardFeet: boardFeet ?? null,
      setsUsed: setsUsed ?? null,
      yieldTarget,
    });

    // Auto-calc gallons from sets if needed
    let gallonsASide = body.gallonsASide != null ? parseFloat(body.gallonsASide) : existing.gallonsASide;
    let gallonsBSide = body.gallonsBSide != null ? parseFloat(body.gallonsBSide) : existing.gallonsBSide;
    let gallonsTotal = body.gallonsTotal != null ? parseFloat(body.gallonsTotal) : existing.gallonsTotal;
    if (setsUsed && !gallonsTotal) {
      gallonsTotal = setsUsed * 48;
      gallonsASide = setsUsed * 24;
      gallonsBSide = setsUsed * 24;
    }

    // Build patch — only set fields the request actually included so we
    // don't accidentally null out stuff that wasn't sent.
    const data: Record<string, unknown> = {
      ...(body.foamSystemId !== undefined ? { foamSystemId: body.foamSystemId || null } : {}),
      ...(body.jobSiteId !== undefined ? { jobSiteId: body.jobSiteId || null } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.substrate !== undefined ? { substrate: body.substrate || null } : {}),
      ...(body.chamberSize !== undefined ? { chamberSize: body.chamberSize ? parseInt(body.chamberSize) : null } : {}),
      ...(body.jobType !== undefined ? { jobType: body.jobType || null } : {}),
      ...(setsUsed !== existing.setsUsed ? { setsUsed } : {}),
      ...(boardFeet !== existing.boardFeet ? { boardFeet } : {}),
      ...(body.squareFeet !== undefined ? { squareFeet: body.squareFeet ? parseFloat(body.squareFeet) : null } : {}),
      ...(body.thickness !== undefined ? { thickness: body.thickness ? parseFloat(body.thickness) : null } : {}),
      ...(gallonsASide !== existing.gallonsASide ? { gallonsASide } : {}),
      ...(gallonsBSide !== existing.gallonsBSide ? { gallonsBSide } : {}),
      ...(gallonsTotal !== existing.gallonsTotal ? { gallonsTotal } : {}),
      ...(amb != null ? { ambientTemp: amb } : {}),
      ...(body.substrateTemp !== undefined ? { substrateTemp: body.substrateTemp ? parseFloat(body.substrateTemp) : null } : {}),
      ...(hum != null ? { humidity: hum } : {}),
      ...(dewPoint !== existing.dewPoint ? { dewPoint } : {}),
      ...(body.hoseTempA !== undefined ? { hoseTempA: body.hoseTempA ? parseFloat(body.hoseTempA) : null } : {}),
      ...(body.hoseTempB !== undefined ? { hoseTempB: body.hoseTempB ? parseFloat(body.hoseTempB) : null } : {}),
      ...(body.drumTempA !== undefined ? { drumTempA: body.drumTempA ? parseFloat(body.drumTempA) : null } : {}),
      ...(body.drumTempB !== undefined ? { drumTempB: body.drumTempB ? parseFloat(body.drumTempB) : null } : {}),
      ...(body.pressureA !== undefined ? { pressureA: body.pressureA ? parseFloat(body.pressureA) : null } : {}),
      ...(body.pressureB !== undefined ? { pressureB: body.pressureB ? parseFloat(body.pressureB) : null } : {}),
      ...(body.rating !== undefined ? { rating: body.rating ? parseInt(body.rating) : null } : {}),
      ...(body.problems !== undefined ? { problems: body.problems || [] } : {}),
      ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
      ...(body.photos !== undefined ? { photos: body.photos || [] } : {}),
      ...(yieldActual !== existing.yieldActual ? { yieldActual } : {}),
      ...(yieldTarget !== existing.yieldTarget ? { yieldTarget } : {}),
      ...(yieldVariance !== existing.yieldVariance ? { yieldVariance } : {}),
    };

    if (finish) {
      data.status = 'complete';
      data.eodLoggedAt = new Date();
    }

    const updated = await prisma.foamJob.update({
      where: { id: jobId },
      data,
      include: { foamSystem: true, jobSite: true },
    });

    // Optionally roll the day-end decision up to the site itself.
    if (body.siteEndStatus && updated.jobSiteId) {
      const allowed = ['in_progress', 'on_hold', 'complete'];
      if (allowed.includes(body.siteEndStatus)) {
        await prisma.foamJobSite.update({
          where: { id: updated.jobSiteId },
          data: { status: body.siteEndStatus, updatedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[PatchJob]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update job' } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, ctx: Params) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { jobId } = await ctx.params;

  const existing = await prisma.foamJob.findUnique({ where: { id: jobId } });
  if (!existing) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && existing.userId !== session.userId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  await prisma.foamJob.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}
