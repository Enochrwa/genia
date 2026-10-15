import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify, errors as joseErrors } from "jose";

const ISSUER = "genia";
const AUDIENCE = "genia-api";

export interface AccessClaims {
  userId: string;
  sessionId: string;
}

const key = (secret: string) => new TextEncoder().encode(secret);

export async function signAccessToken(
  claims: AccessClaims,
  secret: string,
  ttlSeconds: number,
  now: Date,
): Promise<string> {
  const iat = Math.floor(now.getTime() / 1000);
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(iat)
    .setExpirationTime(iat + ttlSeconds)
    .sign(key(secret));
}

export type VerifyResult =
  { ok: true; claims: AccessClaims } | { ok: false; reason: "expired" | "invalid" };

export async function verifyAccessToken(
  token: string,
  secret: string,
  now: Date,
): Promise<VerifyResult> {
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
      currentDate: now,
    });
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, claims: { userId: payload.sub, sessionId: payload.sid } };
  } catch (err) {
    return { ok: false, reason: err instanceof joseErrors.JWTExpired ? "expired" : "invalid" };
  }
}

/** Opaque 256-bit refresh token. Only its SHA-256 is stored. */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
