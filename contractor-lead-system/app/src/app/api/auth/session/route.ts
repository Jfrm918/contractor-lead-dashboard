import { getSession } from "@/lib/auth";
import { apiError } from "@/lib/api-response";

// GET /api/auth/session
export async function GET(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return apiError("Not authenticated", 401);
  }

  return Response.json({
    success: true,
    data: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      clientId: session.clientId,
    },
  });
}
