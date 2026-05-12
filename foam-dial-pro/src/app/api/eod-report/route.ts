import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getCurrentWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  // Parse date or default to today
  const targetDate = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const where = {
    ...(session.role === "admin"
      ? {}
      : { companyId: session.companyId, userId: session.userId }),
    date: { gte: startOfDay, lte: endOfDay },
  };

  try {
    const jobs = await prisma.foamJob.findMany({
      where,
      include: {
        foamSystem: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { date: "asc" },
    });

    const jobCount = jobs.length;
    const totalSets = jobs.reduce((s, j) => s + (j.setsUsed || 0), 0);
    const totalBF = jobs.reduce((s, j) => s + (j.boardFeet || 0), 0);

    const yields = jobs
      .map((j) => j.yieldActual)
      .filter((y): y is number => y != null);
    const avgYield =
      yields.length > 0
        ? Math.round(yields.reduce((a, b) => a + b, 0) / yields.length)
        : 0;

    const target =
      jobs.find((j) => j.foamSystem?.yieldPerSet)?.foamSystem?.yieldPerSet ||
      20000;
    const yieldPercent = target > 0 ? Math.round((avgYield / target) * 100) : 100;

    // Collect all problems from today's jobs
    const problems: string[] = [];
    for (const j of jobs) {
      const probs = Array.isArray(j.problems) ? j.problems : [];
      for (const p of probs) {
        if (p && p !== "None" && !problems.includes(p as string)) {
          problems.push(p as string);
        }
      }
    }

    // Fetch current weather
    const weather = await getCurrentWeather();

    const dateStr = startOfDay.toISOString().split("T")[0];

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        jobCount,
        totalSets: Math.round(totalSets * 100) / 100,
        totalBF: Math.round(totalBF),
        avgYield,
        yieldPercent,
        target,
        weather: {
          temp: weather.temp,
          humidity: weather.humidity,
          conditions: weather.conditions,
        },
        problems,
        jobs: jobs.map((j) => ({
          id: j.id,
          location: j.location,
          setsUsed: j.setsUsed,
          boardFeet: j.boardFeet,
          yieldActual: j.yieldActual,
          jobType: j.jobType,
          substrate: j.substrate,
          problems: j.problems,
        })),
      },
    });
  } catch (err) {
    console.error("[EODReport]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to generate report" } },
      { status: 500 }
    );
  }
}
