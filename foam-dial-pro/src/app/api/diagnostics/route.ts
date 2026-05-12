import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const diagnostics = await prisma.foamDiagnostic.findMany({
    orderBy: { severity: "asc" },
  });

  return NextResponse.json({ success: true, data: diagnostics });
}
