import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export interface JWTPayload extends JwtPayload {
  userId: number;
  email: string;
}

/**
 * Generate JWT access token
 */
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp" | "nbf" | "jti" | "aud" | "sub" | "iss">): string {
  // @ts-ignore - jwt.sign expiresIn accepts string
  return jwt.sign({ userId: payload.userId, email: payload.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate refresh token (longer expiry)
 */
export function generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp" | "nbf" | "jti" | "aud" | "sub" | "iss">): string {
  // @ts-ignore - jwt.sign expiresIn accepts string
  return jwt.sign({ userId: payload.userId, email: payload.email }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}
