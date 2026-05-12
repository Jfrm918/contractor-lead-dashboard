import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { calculateDewPoint, calculateYield } from "@/lib/foam-calc";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const where =
    session.role === "admin"
      ? {}
      : { companyId: session.companyId, userId: session.userId };

  const jobs = await prisma.foamJob.findMany({
    where,
    include: { foamSystem: true, user: { select: { name: true, email: true } } },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, data: jobs });
}

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Auto-calculate dew point
    let dewPoint: number | null = null;
    if (body.ambientTemp != null && body.humidity != null) {
      dewPoint = calculateDewPoint(body.ambientTemp, body.humidity);
    }

    // Get yield target from foam system
    let yieldTarget: number | null = null;
    if (body.foamSystemId) {
      const foam = await prisma.foamSystem.findUnique({
        where: { id: body.foamSystemId },
      });
      if (foam) {
        yieldTarget = foam.yieldPerSet;
      }
    }

    // Calculate yield metrics
    const { yieldActual, yieldVariance } = calculateYield({
      boardFeet: body.boardFeet ?? null,
      setsUsed: body.setsUsed ?? null,
      yieldTarget,
    });

    // Calculate gallons from sets if not provided directly
    const setsUsed = body.setsUsed ? parseFloat(body.setsUsed) : null;
    let gallonsASide = body.gallonsASide ? parseFloat(body.gallonsASide) : null;
    let gallonsBSide = body.gallonsBSide ? parseFloat(body.gallonsBSide) : null;
    let gallonsTotal = body.gallonsTotal ? parseFloat(body.gallonsTotal) : null;

    // Auto-calc gallons from sets (1 set = 48 gallons)
    if (setsUsed && !gallonsTotal) {
      gallonsTotal = setsUsed * 48;
      gallonsASide = setsUsed * 24;
      gallonsBSide = setsUsed * 24;
    }

    // Phase: "morning" creates an in-progress job (no production data yet).
    // "complete" (default) creates a fully-logged job in one shot, matching legacy behavior.
    const phase = body.phase === 'morning' ? 'morning' : 'complete';
    const now = new Date();

    const job = await prisma.foamJob.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        foamSystemId: body.foamSystemId || null,
        jobSiteId: body.jobSiteId || null,
        date: new Date(body.date),
        location: body.location,
        substrate: body.substrate || null,
        chamberSize: body.chamberSize ? parseInt(body.chamberSize) : null,
        status: phase === 'morning' ? 'in_progress' : 'complete',
        morningLoggedAt: now,
        eodLoggedAt: phase === 'complete' ? now : null,
        setsUsed: setsUsed,
        boardFeet: body.boardFeet ? parseFloat(body.boardFeet) : null,
        squareFeet: body.squareFeet ? parseFloat(body.squareFeet) : null,
        thickness: body.thickness ? parseFloat(body.thickness) : null,
        gallonsASide,
        gallonsBSide,
        gallonsTotal,
        jobType: body.jobType || null,
        ambientTemp: body.ambientTemp ? parseFloat(body.ambientTemp) : null,
        substrateTemp: body.substrateTemp
          ? parseFloat(body.substrateTemp)
          : null,
        humidity: body.humidity ? parseFloat(body.humidity) : null,
        dewPoint,
        hoseTempA: body.hoseTempA ? parseFloat(body.hoseTempA) : null,
        hoseTempB: body.hoseTempB ? parseFloat(body.hoseTempB) : null,
        drumTempA: body.drumTempA ? parseFloat(body.drumTempA) : null,
        drumTempB: body.drumTempB ? parseFloat(body.drumTempB) : null,
        pressureA: body.pressureA ? parseFloat(body.pressureA) : null,
        pressureB: body.pressureB ? parseFloat(body.pressureB) : null,
        rating: body.rating ? parseInt(body.rating) : null,
        problems: body.problems || [],
        notes: body.notes || null,
        yieldActual,
        yieldTarget,
        yieldVariance,
        photos: body.photos || [],
      },
      include: { foamSystem: true },
    });

    // Check yield trend: query last 5 jobs for consecutive below-target streak
    let yieldAlert: { streakCount: number; alertActive: boolean } | null = null;
    if (yieldActual != null && yieldVariance != null) {
      try {
        const recentJobs = await prisma.foamJob.findMany({
          where: {
            userId: session.userId,
            companyId: session.companyId,
            yieldVariance: { not: null },
          },
          orderBy: { date: "desc" },
          take: 5,
          select: { yieldVariance: true },
        });

        let streak = 0;
        for (const rj of recentJobs) {
          if (rj.yieldVariance != null && rj.yieldVariance < -10) {
            streak++;
          } else {
            break;
          }
        }

        yieldAlert = { streakCount: streak, alertActive: streak >= 3 };
      } catch {
        // Non-critical, don't fail the save
      }
    }

    return NextResponse.json({ success: true, data: job, yieldAlert });
  } catch (err) {
    console.error("[CreateJob]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create job" } },
      { status: 500 }
    );
  }
}
