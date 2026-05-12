import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    // Get last 5 jobs with yield data
    const recentJobs = await prisma.foamJob.findMany({
      where: {
        userId: session.userId,
        companyId: session.companyId,
        yieldActual: { not: null },
      },
      orderBy: { date: "desc" },
      take: 5,
      include: { foamSystem: true },
    });

    if (recentJobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasData: false,
          avgYield: 0,
          avgYieldPercent: 0,
          trend: "stable" as const,
          streakCount: 0,
          alertActive: false,
          alertLevel: "green" as const,
          causes: [],
          jobs: [],
        },
      });
    }

    const yields = recentJobs.map((j) => j.yieldActual!);
    const avgYield = Math.round(yields.reduce((a, b) => a + b, 0) / yields.length);
    const target = recentJobs[0].foamSystem?.yieldPerSet || recentJobs[0].yieldTarget || 20000;
    const avgYieldPercent = Math.round((avgYield / target) * 100);

    // Determine trend from the jobs (newest first in recentJobs)
    let trend: "up" | "down" | "stable" = "stable";
    if (yields.length >= 3) {
      const recentHalf = yields.slice(0, Math.floor(yields.length / 2));
      const olderHalf = yields.slice(Math.floor(yields.length / 2));
      const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;
      const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
      if (diff > 3) trend = "up";
      else if (diff < -3) trend = "down";
    }

    // Check for consecutive below-target streak
    let streakCount = 0;
    for (const job of recentJobs) {
      if (job.yieldVariance != null && job.yieldVariance < -10) {
        streakCount++;
      } else {
        break;
      }
    }

    // Determine alert status
    const alertActive = streakCount >= 3;
    let alertLevel: "green" | "yellow" | "red" = "green";
    if (streakCount >= 3) alertLevel = "red";
    else if (streakCount >= 2 || avgYieldPercent < 90) alertLevel = "yellow";

    // Analyze conditions for likely causes
    const causes: string[] = [];
    if (alertActive || alertLevel !== "green") {
      const alertJobs = recentJobs.slice(0, Math.max(streakCount, 3));

      const avgHumidity =
        alertJobs.filter((j) => j.humidity != null).reduce((s, j) => s + j.humidity!, 0) /
        (alertJobs.filter((j) => j.humidity != null).length || 1);

      const avgAmbient =
        alertJobs.filter((j) => j.ambientTemp != null).reduce((s, j) => s + j.ambientTemp!, 0) /
        (alertJobs.filter((j) => j.ambientTemp != null).length || 1);

      const avgDrumA =
        alertJobs.filter((j) => j.drumTempA != null).reduce((s, j) => s + j.drumTempA!, 0) /
        (alertJobs.filter((j) => j.drumTempA != null).length || 1);

      if (avgHumidity > 70) {
        causes.push(`High humidity (avg ${Math.round(avgHumidity)}%) - moisture interference reduces yield and adhesion`);
      }
      if (avgAmbient < 50) {
        causes.push(`Cold conditions (avg ${Math.round(avgAmbient)}F) - slow reaction, poor expansion, more overspray`);
      }
      if (avgAmbient > 90) {
        causes.push(`Extreme heat (avg ${Math.round(avgAmbient)}F) - fast reaction causing blow-off and poor adhesion`);
      }
      if (avgDrumA > 0 && avgDrumA < 65) {
        causes.push(`Cold drums (avg ${Math.round(avgDrumA)}F) - material viscosity too high, poor atomization`);
      }

      // Check for common problems
      const allProblems = alertJobs.flatMap((j) => {
        const p = j.problems;
        return Array.isArray(p) ? (p as string[]) : [];
      });
      const problemCounts: Record<string, number> = {};
      for (const p of allProblems) {
        if (p && p !== "None") problemCounts[p] = (problemCounts[p] || 0) + 1;
      }
      const topProblem = Object.entries(problemCounts).sort((a, b) => b[1] - a[1])[0];
      if (topProblem && topProblem[1] >= 2) {
        causes.push(`Recurring "${topProblem[0]}" issue (${topProblem[1]}x in recent jobs)`);
      }

      if (causes.length === 0) {
        causes.push("No obvious environmental cause - check gun/nozzle wear, ratio balance, and pass technique");
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hasData: true,
        avgYield,
        avgYieldPercent,
        target,
        trend,
        streakCount,
        alertActive,
        alertLevel,
        causes,
        jobs: recentJobs.map((j) => ({
          id: j.id,
          date: j.date,
          location: j.location,
          yieldActual: j.yieldActual,
          yieldVariance: j.yieldVariance,
          rating: j.rating,
        })),
      },
    });
  } catch (err) {
    console.error("[YieldAlerts]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get yield alerts" } },
      { status: 500 }
    );
  }
}
