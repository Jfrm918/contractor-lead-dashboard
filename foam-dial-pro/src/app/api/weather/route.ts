import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentWeather, geocodeLocation } from "@/lib/weather";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  // 1. Explicit location param takes priority
  if (location) {
    const geo = await geocodeLocation(location);
    if (geo) {
      const weather = await getCurrentWeather(geo.lat, geo.lon, geo.name);
      return NextResponse.json({ success: true, data: weather });
    }
  }

  // 2. Fall back to user's saved profile location
  const user = await prisma.foamUser.findUnique({
    where: { id: session.userId },
    select: { location: true },
  });

  if (user?.location) {
    const geo = await geocodeLocation(user.location);
    if (geo) {
      const weather = await getCurrentWeather(geo.lat, geo.lon, geo.name);
      return NextResponse.json({ success: true, data: weather });
    }
  }

  // 3. Final fallback (Tulsa, OK defaults)
  const weather = await getCurrentWeather();
  return NextResponse.json({ success: true, data: weather });
}
