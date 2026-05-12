import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDialInRecommendation } from "@/lib/foam-calc";

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ambientTemp, humidity, substrate, jobType, foamSystemId } = body;

    const ambient = parseFloat(ambientTemp);
    const rh = parseFloat(humidity);

    if (isNaN(ambient) || isNaN(rh)) {
      return NextResponse.json(
        { success: false, error: { message: "ambientTemp and humidity are required" } },
        { status: 400 }
      );
    }

    // Build query for similar historical jobs
    const tempMin = ambient - 10;
    const tempMax = ambient + 10;
    const humMin = rh - 15;
    const humMax = rh + 15;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: session.userId,
      companyId: session.companyId,
      ambientTemp: { gte: tempMin, lte: tempMax },
      humidity: { gte: humMin, lte: humMax },
      rating: { gte: 4 },
    };

    if (substrate) where.substrate = substrate;
    if (jobType) where.jobType = jobType;

    // Find highest-rated matching job
    const matchingJob = await prisma.foamJob.findFirst({
      where,
      orderBy: [{ rating: "desc" }, { date: "desc" }],
      include: { foamSystem: true },
    });

    if (matchingJob && matchingJob.hoseTempA != null) {
      // Historical match found
      const dateStr = new Date(matchingJob.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return NextResponse.json({
        success: true,
        data: {
          source: "historical",
          context: `Based on your ${dateStr} job at ${matchingJob.location} (rated ${matchingJob.rating}/5)`,
          hoseTempA: matchingJob.hoseTempA,
          hoseTempB: matchingJob.hoseTempB,
          drumTempA: matchingJob.drumTempA,
          drumTempB: matchingJob.drumTempB,
          pressureA: matchingJob.pressureA,
          pressureB: matchingJob.pressureB,
          matchedJobId: matchingJob.id,
          matchedRating: matchingJob.rating,
          matchedYield: matchingJob.yieldActual,
        },
      });
    }

    // No historical match - fall back to calculator logic
    let foamType: "open_cell" | "closed_cell" = "closed_cell";
    if (foamSystemId) {
      const foam = await prisma.foamSystem.findUnique({
        where: { id: foamSystemId },
      });
      if (foam) {
        foamType = foam.type === "open_cell" ? "open_cell" : "closed_cell";
      }
    }

    const substrateTemp = ambient - 5; // estimate
    const foamSystem = foamType === "open_cell" ? "accufoam_af1" : "enverge_easyseal";
    const calc = getDialInRecommendation({
      ambient,
      substrate: substrateTemp,
      humidity: rh,
      foamSystem,
    });

    return NextResponse.json({
      success: true,
      data: {
        source: "calculator",
        context: `Calculated from ${calc.foamSystemName} TDS for ${ambient}F / ${rh}% RH`,
        hoseTempA: calc.recHoseTemp,
        hoseTempB: calc.recHoseTemp,
        drumTempA: calc.recDrumTemp,
        drumTempB: calc.recDrumTemp,
        pressureA: calc.recPressure ?? (foamType === "closed_cell" ? 1200 : 1100),
        pressureB: calc.recPressure ?? (foamType === "closed_cell" ? 1200 : 1100),
        alerts: calc.alerts,
        status: calc.status,
      },
    });
  } catch (err) {
    console.error("[Recommendations]", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to get recommendations" } },
      { status: 500 }
    );
  }
}
