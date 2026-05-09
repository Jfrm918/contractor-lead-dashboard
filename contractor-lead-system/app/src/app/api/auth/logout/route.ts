import { buildClearSessionCookie } from "@/lib/auth";

// POST /api/auth/logout
export async function POST() {
  return Response.json(
    { success: true, data: { message: "Logged out" } },
    {
      status: 200,
      headers: {
        "Set-Cookie": buildClearSessionCookie(),
      },
    },
  );
}
