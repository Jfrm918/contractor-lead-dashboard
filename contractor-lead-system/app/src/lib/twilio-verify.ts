/**
 * Twilio webhook signature validation.
 *
 * Implements Twilio's request signing algorithm (HMAC-SHA1 of URL + sorted
 * POST params) without pulling in the full Twilio SDK.
 *
 * @see https://www.twilio.com/docs/usage/security#validating-requests
 */

import { env } from "./env";
import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from "crypto";

/**
 * Validate that an incoming request was signed by Twilio.
 *
 * @param request  The incoming Request object
 * @param params   The parsed POST body key/value pairs (form-encoded or JSON)
 * @returns `true` if the signature is valid (or validation is skipped in dev)
 */
export async function validateTwilioSignature(
  request: Request,
  params: Record<string, unknown>,
): Promise<boolean> {
  const authToken = env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.warn(
      "[Twilio Verify] TWILIO_AUTH_TOKEN not set — skipping signature validation (dev mode)",
    );
    return true;
  }

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) {
    console.warn("[Twilio Verify] Missing X-Twilio-Signature header");
    return false;
  }

  // Reconstruct the full URL Twilio used to sign the request.
  // In production behind a proxy/load-balancer, the `x-forwarded-proto` and
  // `x-forwarded-host` headers may be needed. We fall back to the request URL.
  const url = buildCanonicalUrl(request);

  const expected = computeSignature(authToken, url, params);
  return timingSafeEqual(signature, expected);
}

// ─── Internal helpers ───

/**
 * Build the canonical URL that Twilio used when computing the signature.
 * Twilio signs against the full URL (scheme + host + path) with no query string.
 */
function buildCanonicalUrl(request: Request): string {
  const reqUrl = new URL(request.url);

  // Respect forwarded headers if present (common behind Vercel / nginx)
  const proto =
    request.headers.get("x-forwarded-proto") ?? reqUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    reqUrl.host;

  return `${proto}://${host}${reqUrl.pathname}`;
}

/**
 * Compute the expected Twilio signature.
 *
 * Algorithm:
 *   1. Start with the full URL (no query params).
 *   2. Sort the POST body keys alphabetically.
 *   3. Append each key + value to the URL string.
 *   4. HMAC-SHA1 the result with the auth token, then base64-encode.
 */
function computeSignature(
  authToken: string,
  url: string,
  params: Record<string, unknown>,
): string {
  let data = url;

  const sortedKeys = Object.keys(params).sort();
  for (const key of sortedKeys) {
    data += key + String(params[key] ?? "");
  }

  return createHmac("sha1", authToken).update(data, "utf-8").digest("base64");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  // Node's crypto.timingSafeEqual requires equal-length buffers (guarded above).
  try {
    return nodeTimingSafeEqual(bufA, bufB);
  } catch {
    // Fallback — still constant-time-ish
    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }
    return result === 0;
  }
}
