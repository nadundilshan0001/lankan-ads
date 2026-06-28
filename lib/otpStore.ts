// ============================================================
// Lankan Ads — In-Memory OTP Store for Resets & Verification
// Persists across Next.js dev server hot-reloads
// ============================================================

interface OtpData {
  otpCode: string;
  expiresAt: Date;
  used: boolean;
}

const globalForOtp = global as unknown as {
  otpStore: Map<string, OtpData>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpData>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.otpStore = otpStore;
}
