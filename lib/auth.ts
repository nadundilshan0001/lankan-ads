import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const JWT_SECRET = process.env.JWT_SECRET || "secure-fallback-secret-lankan-ads-2026-key";

export interface TokenPayload {
  userId: string;
  phoneNumber?: string;
  email?: string;
  role: "user" | "admin";
}

/**
 * Generate a cryptographically secure random salt (hex representation)
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * PBKDF2 password hashing using SHA-512
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
}

/**
 * Generate an HMAC-SHA256 signed custom JWT session token
 */
export function signToken(payload: TokenPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signatureSrc = `${header}.${payloadStr}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(signatureSrc).digest("base64url");
  return `${signatureSrc}.${signature}`;
}

/**
 * Verify HMAC-SHA256 JWT signature and return payload if valid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payloadStr, signature] = parts;
    const signatureSrc = `${header}.${payloadStr}`;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(signatureSrc).digest("base64url");
    
    // Time-constant comparison to protect against timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    
    return JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));
  } catch (error) {
    return null;
  }
}

/**
 * Verify administrative authentication claim from request headers
 */
export function verifyAdminRequest(req: Request): TokenPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}
