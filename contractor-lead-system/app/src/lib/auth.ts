/**
 * Authentication utilities — password hashing, JWT tokens, session helpers.
 *
 * Uses Web Crypto (crypto.subtle) for password hashing and `jose` for JWTs.
 * No heavy dependencies.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "./env";

// ─── Password hashing (PBKDF2 via crypto.subtle) ───

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Hash a plaintext password using PBKDF2-SHA256.
 * Returns a string in the format `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.exportKey("raw", key);

  return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

/**
 * Verify a plaintext password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = fromHex(saltHex);
  const key = await deriveKey(password, salt);
  const derived = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  const expected = fromHex(hashHex);

  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < derived.length; i++) {
    diff |= derived[i] ^ expected[i];
  }
  return diff === 0;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH * 8 },
    true, // extractable so we can export
    ["encrypt"],
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ─── JWT ───

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  clientId: string | null;
}

const JWT_EXPIRY = "7d";
const COOKIE_NAME = "lr_session";

/**
 * Get the JWT secret as a crypto key. Falls back to a dev-only default
 * when JWT_SECRET is not configured.
 */
function getJwtSecret(): Uint8Array {
  if (!env.JWT_SECRET) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable must be set in production. " +
        "Generate one with: openssl rand -hex 32",
      );
    }
    console.warn(
      "[Auth] JWT_SECRET not set — using insecure default (dev mode only)",
    );
  }
  const secret = env.JWT_SECRET ?? "dev-jwt-secret-do-not-use-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * Generate a signed JWT for a user session.
 */
export async function generateToken(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

/**
 * Verify and decode a JWT. Returns null if invalid or expired.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers ───

export { COOKIE_NAME };

/**
 * Build Set-Cookie header value for the session token.
 */
export function buildSessionCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/**
 * Build Set-Cookie header value that clears the session cookie.
 */
export function buildClearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

/**
 * Extract the session token from a Request's cookies.
 */
export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === COOKIE_NAME) {
      return rest.join("="); // rejoin in case token contains '='
    }
  }
  return null;
}

/**
 * Get the current session from a request. Returns null if not authenticated.
 */
export async function getSession(request: Request): Promise<SessionPayload | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
