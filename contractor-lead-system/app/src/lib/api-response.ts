/**
 * Consistent JSON envelope used across all API routes.
 * Matches the contract in API_SERVICE_CONTRACTS_V1.md.
 */

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: { message } }, { status });
}

export function apiServerError(err: unknown): Response {
  const message =
    err instanceof Error ? err.message : "Internal server error";
  console.error("[API Error]", err);
  return Response.json(
    { success: false, error: { message: "Internal server error" } },
    { status: 500 },
  );
}
