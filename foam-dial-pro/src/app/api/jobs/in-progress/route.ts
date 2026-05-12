import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Returns this user's in-progress jobs, newest first. Powers the dashboard's
// "Active job" / "Resume today's job" card.
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const where =
    session.role === 'admin'
      ? { status: 'in_progress' }
      : { status: 'in_progress', companyId: session.companyId, userId: session.userId };

  const jobs = await prisma.foamJob.findMany({
    where,
    include: {
      foamSystem: true,
      jobSite: true,
      events: { orderBy: { timestamp: 'desc' }, take: 5 },
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ success: true, data: jobs });
}
