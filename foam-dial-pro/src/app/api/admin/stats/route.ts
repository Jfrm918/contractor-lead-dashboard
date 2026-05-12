import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const [companies, users, jobs, recentJobs] = await Promise.all([
    prisma.foamCompany.findMany({
      include: {
        _count: { select: { users: true, jobs: true } },
      },
    }),
    prisma.foamUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        company: { select: { name: true } },
        _count: { select: { jobs: true } },
      },
    }),
    prisma.foamJob.findMany({
      select: {
        id: true,
        userId: true,
        companyId: true,
        rating: true,
        yieldActual: true,
        yieldTarget: true,
        yieldVariance: true,
        problems: true,
        date: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.foamJob.findMany({
      include: {
        user: { select: { name: true } },
        company: { select: { name: true } },
        foamSystem: { select: { product: true } },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  // Problem frequency analysis
  const problemCounts: Record<string, number> = {};
  for (const job of jobs) {
    const probs = job.problems as string[];
    if (Array.isArray(probs)) {
      for (const p of probs) {
        problemCounts[p] = (problemCounts[p] || 0) + 1;
      }
    }
  }

  const topProblems = Object.entries(problemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([problem, count]) => ({ problem, count }));

  // Per-user yield stats
  const userStats = users.map((u) => {
    const userJobs = jobs.filter((j) => j.userId === u.id);
    const yields = userJobs
      .map((j) => j.yieldActual)
      .filter((y): y is number => y != null);
    const ratings = userJobs
      .map((j) => j.rating)
      .filter((r): r is number => r != null);

    return {
      ...u,
      avgYield:
        yields.length > 0
          ? yields.reduce((a, b) => a + b, 0) / yields.length
          : null,
      avgRating:
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null,
      jobCount: userJobs.length,
    };
  });

  // Overall stats
  const allYields = jobs
    .map((j) => j.yieldActual)
    .filter((y): y is number => y != null);
  const avgYield =
    allYields.length > 0
      ? allYields.reduce((a, b) => a + b, 0) / allYields.length
      : 0;

  const allRatings = jobs
    .map((j) => j.rating)
    .filter((r): r is number => r != null);
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

  return NextResponse.json({
    success: true,
    data: {
      companies,
      userStats,
      recentJobs,
      topProblems,
      totalJobs: jobs.length,
      avgYield,
      avgRating,
    },
  });
}
