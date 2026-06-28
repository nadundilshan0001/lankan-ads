import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

// SECURITY: Never fall back to a hardcoded secret — throw at startup if missing.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "Add JWT_SECRET to .env.local before starting the server."
  );
}

// Token lifetime: 24 hours
const JWT_EXPIRY_SECONDS = 24 * 60 * 60;

export interface TokenPayload {
  userId: string;
  phoneNumber?: string;
  email?: string;
  role: "user" | "admin";
  exp?: number;
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
 * Generate an HMAC-SHA256 signed JWT session token with expiry
 */
export function signToken(payload: TokenPayload): string {
  const payloadWithExp: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS,
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payloadStr = Buffer.from(JSON.stringify(payloadWithExp)).toString("base64url");
  const signatureSrc = `${header}.${payloadStr}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET!).update(signatureSrc).digest("base64url");
  return `${signatureSrc}.${signature}`;
}

/**
 * Verify HMAC-SHA256 JWT signature and expiry, return payload if valid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payloadStr, signature] = parts;
    const signatureSrc = `${header}.${payloadStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET!)
      .update(signatureSrc)
      .digest("base64url");

    // Timing-safe comparison (guards against length mismatch crash too)
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return null;
    }

    const parsed: TokenPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf8")
    );

    // Enforce token expiry
    if (parsed.exp && Math.floor(Date.now() / 1000) > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
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

