import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      companyId: session.companyId,
    },
  });
}
