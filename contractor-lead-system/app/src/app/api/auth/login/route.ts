import { prisma, dbAvailable } from "@/lib/db";
import { apiError, apiServerError } from "@/lib/api-response";
import {
  verifyPassword,
  generateToken,
  buildSessionCookie,
} from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid email or password", 400);
    }

    const { email, password } = parsed.data;

    if (!dbAvailable) {
      return apiError(
        "Authentication requires a database connection",
        503,
      );
    }

    // Look up user by email
    const user = await prisma!.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError("Invalid email or password", 401);
    }

    // Generate JWT
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
    });

    // Return user info + set httpOnly cookie
    const response = Response.json(
      {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookie(token),
        },
      },
    );

    return response;
  } catch (err) {
    return apiServerError(err);
  }
}
