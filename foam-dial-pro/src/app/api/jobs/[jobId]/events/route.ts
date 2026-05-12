import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

type Params = { params: Promise<{ jobId: string }> };

// List events for a job, oldest-first.
export async function GET(request: Request, ctx: Params) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { jobId } = await ctx.params;

  const job = await prisma.foamJob.findUnique({ where: { id: jobId }, select: { userId: true } });
  if (!job) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && job.userId !== session.userId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const events = await prisma.foamJobEvent.findMany({
    where: { jobId },
    orderBy: { timestamp: 'asc' },
  });
  return NextResponse.json({ success: true, data: events });
}

// Append a midday event to a job.
//
// Accepted body:
//   { eventType: "temp_change" | "pressure_change" | "problem" | "note" | "yield_observation",
//     payload: object,
//     notes?: string,
//     timestamp?: ISO string (defaults to now) }
export async function POST(request: Request, ctx: Params) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { jobId } = await ctx.params;

  const job = await prisma.foamJob.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ success: false }, { status: 404 });
  if (session.role !== 'admin' && job.userId !== session.userId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  try {
    const body = await request.json();
    const valid = ['temp_change', 'pressure_change', 'problem', 'note', 'yield_observation'];
    if (!body.eventType || !valid.includes(body.eventType)) {
      return NextResponse.json(
        { success: false, error: { message: `eventType must be one of: ${valid.join(', ')}` } },
        { status: 400 },
      );
    }
    const event = await prisma.foamJobEvent.create({
      data: {
        jobId,
        companyId: job.companyId,
        userId: session.userId,
        eventType: body.eventType,
        payload: body.payload || {},
        notes: body.notes || null,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    });
    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error('[CreateJobEvent]', err);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create event' } },
      { status: 500 },
    );
  }
}
